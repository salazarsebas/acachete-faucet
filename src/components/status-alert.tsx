"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, InfoIcon } from "lucide-react";

type StatusAlertProps = {
  title?: string;
  message: string;
  variant: "success" | "error" | "info";
};

export function StatusAlert({ title, message, variant }: StatusAlertProps) {
  const getIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle className="text-green-500" />;
      case "error":
        return <AlertCircle className="text-red-500" />;
      case "info":
        return <InfoIcon className="text-blue-500" />;
      default:
        return null;
    }
  };

  const getAlertVariant = () => {
    switch (variant) {
      case "error":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <Alert variant={getAlertVariant()} className="mb-4">
      {getIcon()}
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
