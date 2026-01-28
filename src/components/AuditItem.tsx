"use client";

import { CheckCircle, XCircle, AlertTriangle, Eye, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditCheckResult } from "@/types/audit";

interface AuditItemProps {
  result: AuditCheckResult;
  className?: string;
}

export function AuditItem({ result, className }: AuditItemProps) {
  const getStatusIcon = () => {
    switch (result.status) {
      case "PASS":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "FAIL":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "WARNING":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "MANUAL_REVIEW":
        return <Eye className="h-5 w-5 text-blue-600" />;
      case "SKIPPED":
        return <MinusCircle className="h-5 w-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusBg = () => {
    switch (result.status) {
      case "PASS":
        return "bg-green-50 border-green-200";
      case "FAIL":
        return "bg-red-50 border-red-200";
      case "WARNING":
        return "bg-yellow-50 border-yellow-200";
      case "MANUAL_REVIEW":
        return "bg-blue-50 border-blue-200";
      case "SKIPPED":
        return "bg-gray-50 border-gray-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4",
        getStatusBg(),
        className
      )}
    >
      <div className="flex-shrink-0 pt-0.5">{getStatusIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-medium text-gray-900">{result.checkName}</h4>
          {result.status !== "SKIPPED" && result.status !== "MANUAL_REVIEW" && (
            <span className="text-sm font-medium text-gray-500">
              {result.score}/100
            </span>
          )}
        </div>
        {result.message && (
          <p className="mt-1 text-sm text-gray-600">{result.message}</p>
        )}
        {result.requiresManualReview && result.manualReviewNote && (
          <p className="mt-2 text-sm text-blue-700 bg-blue-100 rounded px-2 py-1">
            Action: {result.manualReviewNote}
          </p>
        )}
      </div>
    </div>
  );
}

interface AuditItemCompactProps {
  result: AuditCheckResult;
  className?: string;
}

export function AuditItemCompact({ result, className }: AuditItemCompactProps) {
  const getStatusIcon = () => {
    switch (result.status) {
      case "PASS":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "FAIL":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "WARNING":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "MANUAL_REVIEW":
        return <Eye className="h-4 w-4 text-blue-600" />;
      case "SKIPPED":
        return <MinusCircle className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 py-2 px-3 rounded hover:bg-gray-50",
        className
      )}
    >
      {getStatusIcon()}
      <span className="text-sm text-gray-700 flex-1">{result.checkName}</span>
      {result.status !== "SKIPPED" && result.status !== "MANUAL_REVIEW" && (
        <span className="text-xs text-gray-500">{result.score}%</span>
      )}
    </div>
  );
}
