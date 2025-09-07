import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "next-themes"

export default function Header() {
  const { theme } = useTheme();
  
  return (
    <header className="flex justify-between items-center w-full px-1.5 py-0">
      <Link href="/">
        <Image
          src={theme === "dark" ? "/acachete-labs-icon-dark.png" : "/acachete-labs-icon.png"}
          alt="Acachete Labs logo"
          width={100}
          height={22}
          priority
          className="py-0"
        />
      </Link>
      <ThemeToggle />
    </header>
  );
}
