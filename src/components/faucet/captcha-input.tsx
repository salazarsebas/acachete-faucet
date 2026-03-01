"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CaptchaInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CaptchaInput({ value, onChange, disabled }: CaptchaInputProps) {
  const t = useTranslations("faucet");

  return (
    <div className="space-y-2">
      <Label htmlFor="captcha" className="text-sm font-medium">
        {t("captchaLabel")}
      </Label>
      <Input
        id="captcha"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("captchaPlaceholder")}
        disabled={disabled}
        className="text-sm"
      />
      <p className="text-muted-foreground text-xs">{t("captchaHint")}</p>
    </div>
  );
}
