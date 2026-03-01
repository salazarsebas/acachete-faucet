import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t py-6">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <a
            href="https://developers.stellar.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            {t("stellarDocs")}
          </a>
          <a
            href="https://laboratory.stellar.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            {t("stellarLab")}
          </a>
          <a
            href="https://acachete.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            {t("acachete")}
          </a>
        </div>
        <p className="text-muted-foreground/60 text-[10px]">
          &copy; {new Date().getFullYear()} Acachete Labs. {t("rights")}.
        </p>
      </div>
    </footer>
  );
}
