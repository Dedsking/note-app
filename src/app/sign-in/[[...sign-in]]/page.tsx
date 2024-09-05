import { SignIn } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dedsking - Sign In",
  };
  

export default function Page() {
  return (
    <div className="grid h-screen place-content-center">
      <SignIn />
    </div>
  );
}
