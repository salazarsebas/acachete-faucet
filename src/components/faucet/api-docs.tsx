"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CopyButton } from "@/components/shared/copy-button";
import { FadeIn } from "@/components/shared/motion-wrapper";

interface Endpoint {
  method: string;
  path: string;
  description: string;
  body?: string;
  response: string;
  notes?: string[];
}

const endpoints: Endpoint[] = [
  {
    method: "POST",
    path: "/api/fund",
    description: "Fund an account with 10,000 XLM via Friendbot",
    body: `{
  "address": "G... or C...",
  "network": "testnet" | "futurenet",
  "callbackUrl": "https://example.com/webhook" // optional
}`,
    response: `{
  "success": true,
  "message": "Successfully funded account on testnet!",
  "hash": "abc123...",
  "explorerUrl": "https://stellar-explorer.acachete.xyz/testnet/tx/abc123..."
}`,
    notes: ["Rate limit: 5 requests/hour per IP, 1/hour per address"],
  },
  {
    method: "POST",
    path: "/api/fund-token",
    description:
      "Distribute USDC or EURC from Circle's official testnet issuers. Supports both G... (classic) and C... (Soroban SAC) addresses.",
    body: `{
  "address": "G... or C...",
  "network": "testnet",
  "token": "USDC" | "EURC",
  "captcha": "acachete.xyz",
  "callbackUrl": "https://example.com/webhook" // optional
}`,
    response: `{
  "success": true,
  "message": "Successfully sent USDC to G...",
  "hash": "abc123...",
  "explorerUrl": "https://stellar-explorer.acachete.xyz/testnet/tx/abc123..."
}`,
    notes: [
      "Rate limit: 5 requests/hour per IP, 1/6h per address+token",
      "G... addresses require a trustline first",
      "C... addresses receive tokens via SAC (no trustline needed)",
    ],
  },
  {
    method: "POST",
    path: "/api/batch-fund",
    description: "Fund up to 10 accounts with XLM in a single request",
    body: `{
  "addresses": ["G...1", "G...2"],
  "network": "testnet",
  "captcha": "acachete.xyz",
  "callbackUrl": "https://example.com/webhook" // optional
}`,
    response: `{
  "success": true,
  "results": [
    { "address": "G...1", "success": true, "hash": "abc..." },
    { "address": "G...2", "success": true, "hash": "def..." }
  ],
  "funded": 2,
  "total": 2
}`,
    notes: ["Rate limit: 2 requests/hour per IP"],
  },
  {
    method: "GET",
    path: "/api/account/{address}?network=testnet",
    description: "Get balances for a Stellar account",
    response: `{
  "success": true,
  "balances": [
    { "assetType": "native", "assetCode": "XLM", "balance": "10000.0000000" },
    { "assetType": "credit_alphanum4", "assetCode": "USDC", "balance": "100.0000000" }
  ]
}`,
    notes: ["Rate limit: 30 requests/min per IP"],
  },
  {
    method: "GET",
    path: "/api/network-status?network=testnet",
    description: "Check testnet or futurenet health",
    response: `{
  "success": true,
  "online": true,
  "lastLedger": 1271195,
  "protocolVersion": 22,
  "timestamp": "2026-03-01T..."
}`,
    notes: ["Rate limit: 60 requests/min per IP"],
  },
];

const rateLimitedResponse = `// 429 Too Many Requests
{
  "success": false,
  "message": "Rate limit exceeded. Try again after 2026-03-01T12:00:00.000Z."
}

// Headers included:
// X-RateLimit-Limit: 5
// X-RateLimit-Remaining: 0
// X-RateLimit-Reset: 1709294400`;

const webhookPayload = `// Webhook POST payload (fire-and-forget)
{
  "event": "fund" | "fund-token" | "batch-fund",
  "success": true,
  "address": "G...",
  "network": "testnet",
  "token": "USDC",        // only for fund-token
  "hash": "abc123...",
  "timestamp": "2026-03-01T..."
}`;

export function ApiDocs() {
  const t = useTranslations("apiDocs");

  return (
    <FadeIn delay={0.5}>
      <Card>
        <CardHeader className="pt-4 pb-2">
          <CardTitle className="text-base font-semibold">
            {t("title")}
          </CardTitle>
          <CardDescription className="text-xs">{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-4">
          <Accordion type="single" collapsible className="w-full">
            {endpoints.map((ep, i) => (
              <AccordionItem key={i} value={`ep-${i}`}>
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={ep.method === "GET" ? "secondary" : "default"}
                      className="font-mono text-[10px]"
                    >
                      {ep.method}
                    </Badge>
                    <span className="font-mono text-xs">{ep.path}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p className="text-muted-foreground text-sm">
                    {ep.description}
                  </p>

                  {ep.notes && (
                    <ul className="text-muted-foreground space-y-0.5 text-[11px]">
                      {ep.notes.map((note, j) => (
                        <li key={j}>- {note}</li>
                      ))}
                    </ul>
                  )}

                  {ep.body && (
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-muted-foreground text-[10px] font-medium uppercase">
                          Request body
                        </span>
                        <CopyButton text={ep.body} className="h-5 w-5" />
                      </div>
                      <pre className="bg-muted overflow-x-auto rounded-md p-2.5 text-[11px]">
                        <code>{ep.body}</code>
                      </pre>
                    </div>
                  )}

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-muted-foreground text-[10px] font-medium uppercase">
                        Response
                      </span>
                      <CopyButton text={ep.response} className="h-5 w-5" />
                    </div>
                    <pre className="bg-muted overflow-x-auto rounded-md p-2.5 text-[11px]">
                      <code>{ep.response}</code>
                    </pre>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}

            <AccordionItem value="rate-limit">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    429
                  </Badge>
                  <span className="text-xs">{t("rateLimitTitle")}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  {t("rateLimitDescription")}
                </p>
                <pre className="bg-muted overflow-x-auto rounded-md p-2.5 text-[11px]">
                  <code>{rateLimitedResponse}</code>
                </pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="webhook">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    Webhook
                  </Badge>
                  <span className="text-xs">{t("webhookTitle")}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  {t("webhookDescription")}
                </p>
                <pre className="bg-muted overflow-x-auto rounded-md p-2.5 text-[11px]">
                  <code>{webhookPayload}</code>
                </pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </FadeIn>
  );
}
