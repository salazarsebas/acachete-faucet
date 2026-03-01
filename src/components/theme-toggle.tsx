"use client";
import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Switch } from "@/components/ui/switch";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div
      className="flex items-center space-x-2 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      suppressHydrationWarning
    >
      <Sun
        suppressHydrationWarning
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isDark
            ? "scale-75 rotate-12 text-[#A1A1AA]"
            : "text-foreground scale-100 rotate-0"
        }`}
      />
      <Switch
        checked={isDark}
        onCheckedChange={toggleTheme}
        aria-label="Toggle theme"
        className="transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110"
        suppressHydrationWarning
      />
      <Moon
        suppressHydrationWarning
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          !isDark
            ? "scale-75 rotate-12 text-[#A1A1AA]"
            : "text-foreground scale-100 rotate-0"
        }`}
      />
    </div>
  );
}
