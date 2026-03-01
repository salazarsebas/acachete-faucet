"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/shared/motion-wrapper";

export function TrustlineGuideSummary() {
  const t = useTranslations("trustlines");
  const locale = useLocale();

  return (
    <FadeIn delay={0.2}>
      <Card>
        <CardHeader className="pt-4 pb-2">
          <CardTitle className="text-base font-semibold">Trustlines</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="what">
              <AccordionTrigger className="text-sm">
                {t("summaryWhat")}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm">
                {t("summaryWhatBrief")}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="why">
              <AccordionTrigger className="text-sm">
                {t("summaryWhy")}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm">
                {t("summaryWhyBrief")}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Link
            href={`/${locale}/trustlines`}
            className="text-muted-foreground hover:text-foreground mt-3 inline-flex items-center gap-1 text-sm transition-colors"
          >
            {t("readFullGuide")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>
    </FadeIn>
  );
}
