import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { SettingsIcon } from "lucide-react";

export default function Header({
  openKeyDialog,
}: {
  openKeyDialog?: () => void;
}) {
  return (
    <header className="px-4 py-2 flex justify-between items-center border-b border-border">
      <h1 className="text-lg font-medium">
        <Logo />
      </h1>
      <nav className="flex flex-row items-center justify-end gap-1">
        <Button variant="ghost" size="sm" asChild>
          <a href="https://nano.deeptech.ai" target="_blank" rel="noopener noreferrer">
            Nano
          </a>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <a
            href="https://deeptech.ai"
            target="_blank"
            rel="noopener noreferrer"
          >
            Deeptech AI
          </a>
        </Button>
        {process.env.NEXT_PUBLIC_CUSTOM_KEY && openKeyDialog && (
          <Button variant="ghost" size="icon" onClick={openKeyDialog}>
            <SettingsIcon className="w-6 h-6" />
          </Button>
        )}
      </nav>
    </header>
  );
}
