"use client";

import { continueConversation, Message } from "@/app/actions";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { readStreamableValue } from "ai/rsc";
// import { Message, useChat } from "ai/react";
import { Bot, Trash, XCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
interface AIChatBoxProps {
  open: boolean;
  onClose: () => void;
}

export default function AIChatBox({ open, onClose }: AIChatBoxProps) {
  // const {
  //   messages,
  //   input,
  //   handleInputChange,
  //   handleSubmit,
  //   setMessages,
  //   isLoading,
  //   error,
  // } = useChat();

  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const lastMessageUser = conversation[conversation.length - 1]?.role == "user";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setInput("");
    setLoading(true);

    setConversation([...conversation, { role: "user", content: input }]);
    const { messages, newMessage } = await continueConversation([
      ...conversation,
      { role: "user", content: input },
    ]);

    let textContent = "";

    for await (const delta of readStreamableValue(newMessage)) {
      textContent = `${textContent}${delta}`;

      setConversation([
        ...messages,
        { role: "assistant", content: textContent },
      ]);
    }
    setLoading(false);
  };

  return (
    <div
      className={cn(
        "bottom-0 right-0 z-10 w-full max-w-[500px] p-1 xl:right-32",
        open ? "fixed" : "hidden",
      )}
    >
      <button onClick={onClose} className="mb-1 ms-auto block">
        <XCircle size={30} className="hover:text-red-500" />
      </button>
      <div className="flex h-[600px] flex-col rounded border bg-background shadow-xl">
        <div className="w mt-5 h-full overflow-y-auto px-3" ref={scrollRef}>
          {/* {messages.map((message) => (
            <ChatMessage message={message} key={message.id} />
          ))} */}
          {conversation.map((message, index) => (
            <div key={index}>
              <ChatMessage message={message} />
            </div>
          ))}
          {loading && lastMessageUser && (
            <ChatMessage
              message={{
                role: "assistant",
                content: "Thinking...",
              }}
            />
          )}
          {conversation.length === 0 && (
            <div className="flex h-full items-center justify-center gap-3">
              <Bot /> Ask Me Something
            </div>
          )}
        </div>
        {/* <form onSubmit={handleSubmit} className="m-3 flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Write Something ..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </form> */}
        <form className="m-3 flex gap-2" onSubmit={handleSubmit}>
          <Button
            title="Clear Chat"
            variant={"outline"}
            size="icon"
            className="shrink-0"
            type="button"
            onClick={() => setConversation([])}
            disabled={loading}
          >
            <Trash />
          </Button>
          <Input
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
            }}
            placeholder="Write Something ..."
            disabled={loading}
            ref={inputRef}
          />
          <Button type="submit" disabled={loading}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}

function ChatMessage({
  message: { role, content },
}: {
  message: Pick<Message, "content" | "role">;
}) {
  const { user } = useUser();
  const isAiMessage = role === "assistant";
  return (
    <div
      className={cn(
        "mb-3 flex items-center",
        isAiMessage ? "me-5 justify-start" : "ms-5 justify-end",
      )}
    >
      {isAiMessage && <Bot className="mr-2 shrink-0" />}
      <p
        className={cn(
          "whitespace-pre-line rounded-md border px-3 py-2",
          isAiMessage ? "bg-background" : "bg-primary text-primary-foreground",
        )}
      >
        {content}
      </p>
      {!isAiMessage && user?.imageUrl && (
        <Image
          src={user.imageUrl}
          alt={"User Image"}
          height={100}
          width={100}
          className="ml-2 h-10 w-10 rounded-full object-cover"
        />
      )}
    </div>
  );
}
