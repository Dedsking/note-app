import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export default function Notification() {
  return (
    <div>
      <Popover>
        <PopoverTrigger className="relative p-2">
          <Bell />
          <div className="absolute right-2 top-1 flex h-3 w-3 items-center justify-center rounded-full bg-rose-500 text-xs text-white" />
        </PopoverTrigger>
        <PopoverContent className="">
          <div className="text-s whitespace-pre-line rounded-md border-s-2 border-s-foreground bg-background px-3 py-2 text-sm">
            Add Note First for better experience
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
