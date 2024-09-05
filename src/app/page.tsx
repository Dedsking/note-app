import Image from "next/image";
import logo from "@/assets/brain.png";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function Home() {
  const { userId } = auth();
  if (userId) redirect("/notes");
  return (
    <main className="flex h-screen flex-col items-center justify-center gap-5">
      <div className="flex items-center gap-2">
        <Image src={logo} alt="..." width={100} height={100} />
        <span className="text-3xl font-extrabold tracking-tight">Dedsking</span>
      </div>
      <p className="max-w-prose text-center">
        an intellegent note taking app with AI integration, built with OpenAI,
        Pinecone, Next.js, Shadcn UI, Clerk, and more.
      </p>
      <Button size={"lg"} asChild>
        <Link href={"/notes"}>Open</Link>
      </Button>
    </main>
  );
}
