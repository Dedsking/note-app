import prisma from "@/lib/db/prisma";
import openai, { getEmbedding } from "@/lib/openai";
import { notesIndex } from "@/lib/pinecone";
import { auth } from "@clerk/nextjs/server";
import { CoreMessage } from "ai";
import { NextResponse } from "next/server";
import { ChatCompletionMessage } from "openai/resources";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const messages: ChatCompletionMessage[] = body.messages;
    const messagesTruncated = messages.slice(-6);

    const embedding = await getEmbedding(
      messagesTruncated.map((message: any) => message.content).join("\n"),
    );

    const { userId } = auth();

    const vectorQueryResponse = await notesIndex.query({
      vector: embedding,
      topK: 1,
      filter: { userId },
    });

    const relevantNote = await prisma.note.findMany({
      where: {
        id: {
          in: vectorQueryResponse.matches.map((match) => match.id),
        },
      },
    });

    // console.log("Relevant notes found: ", relevantNote);

    const systemMessage: CoreMessage = {
      role: "system",
      content:
        "You are an intelligent note-app. You answer the user's questions based on their existing notes." +
        "The relevant nots for this query are: \n" +
        relevantNote
          .map((note) => `Title : ${note.title}\n\nContent${note.content}`)
          .join("\n\n"),
    };

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [systemMessage, ...messagesTruncated],
    });

    console.log(response);
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// export async function getGroqChatCompletion(messages: any) {
//   return groq.chat.completions.create({
//     messages: [systemMessage, ...messagesTruncated],
//     model: "llama3-8b-8192",
//     // stream: true,
//   });
// }

//
