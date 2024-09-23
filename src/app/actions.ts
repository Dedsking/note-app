"use server";

import prisma from "@/lib/db/prisma";
import { createOpenAI as createGroq } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import Groq from "groq-sdk";
import { auth } from "@clerk/nextjs/server";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

// const groq = createGroq({
//   baseURL: "https://api.groq.com/openai/v1",
//   apiKey: process.env.GROQ_API_KEY,
// });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function continueConversation(history: Message[]) {
  "use server";

  const stream = createStreamableValue();

  (async () => {
    // const { textStream } = await streamText({
    //   model: groq("llama3-8b-8192"),
    //   system: "You are a doctor form harvard",
    //   messages: history,
    // });

    const { userId } = await auth();

    const Id = userId as string;

    const relevantNote = await prisma.note.findMany({
      where: {
        userId: { in: [Id] },
      },
    });

    const systemMessage: CoreMessage = {
      role: "system",
      content:
        "You are an intelligent note-app. Your name is Dedsking. if some one asked your name, you will answer, `Hello my name , Dedsking`, if someone asked `hi` or 'hello' or 'halo' or 'hallo' you will aswer 'Hallo'. if someone asked your name you will asnwer `Yes,Sir`. You answer the user's questions based on their existing notes." +
        "The relevant notes for this query are: \n" +
        relevantNote
          .map((note) => `Title : ${note.title}\n\nContent${note.content}`)
          .join("\n\n")
          +"but you have to asnwer to the point.",
    };

    const msgWithSystem = [systemMessage, ...history];

    const chatCompletion = await groq.chat.completions.create({
      messages: msgWithSystem,
      model: "llama3-70b-8192",
    });

    const textSplit = chatCompletion.choices[0].message.content
      ?.split(" ")
      .join(" ");

    for await (const text of textSplit || " ") {
      stream.update(text);
    }

    stream.done();
  })();

  return {
    messages: history,
    newMessage: stream.value,
  };
}
