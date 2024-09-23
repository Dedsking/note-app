"use client";

import logo from "@/assets/brain.png";
import AddEditNoteDialog from "@/components/AddEditNoteDialog";
import AIChatButton from "@/components/AIChatButton";
import Notification from "@/components/Notification";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Plus } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [showAddEditNoteDialog, setShowAddEditNoteDialog] = useState(false);
  const { theme } = useTheme();

  return (
    <>
      <div className="p-4 shadow">
        <div className="m-auto flex w-[400px] flex-wrap items-center justify-between gap-3 md:w-full">
          <Link href={"/notes"} className="flex items-center gap-1">
            <Image src={logo} alt="..." width={40} height={40} />
            <span className="font-bold">Dedsking</span>
          </Link>
          <div className="flex items-center gap-2">
            <Notification />
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                baseTheme: theme === "dark" ? dark : undefined,
                elements: { avatarBox: { width: "2.5rem", height: "2.5rem" } },
              }}
            />
            <ThemeToggleButton />
            <Button onClick={() => setShowAddEditNoteDialog(true)}>
              <Plus className="text-sm" />
              Add Note
            </Button>
            <AIChatButton />
          </div>
        </div>
      </div>
      <AddEditNoteDialog
        open={showAddEditNoteDialog}
        setOpen={setShowAddEditNoteDialog}
      />
    </>
  );
}
