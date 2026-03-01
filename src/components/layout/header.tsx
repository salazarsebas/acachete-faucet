"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { Separator } from "@/components/ui/separator";

export function Header() {
  const locale = useLocale();
  const t = useTranslations("trustlines");
  const { resolvedTheme } = useTheme();

  return (
    <header className="flex w-full items-center justify-between px-3 py-2">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}`} suppressHydrationWarning>
          <Image
            src={
              resolvedTheme === "dark"
                ? "/acachete-labs-icon-dark.png"
                : "/acachete-labs-icon.png"
            }
            alt="Acachete Labs"
            width={100}
            height={22}
            priority
            suppressHydrationWarning
          />
        </Link>
        <Separator orientation="vertical" className="hidden h-5 sm:block" />
        <nav className="hidden items-center gap-3 sm:flex">
          <Link
            href={`/${locale}`}
            className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
          >
            Faucet
          </Link>
          <Link
            href={`/${locale}/trustlines`}
            className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
          >
            {t("pageTitle")}
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
