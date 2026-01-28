import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-100";
  if (score >= 60) return "bg-yellow-100";
  return "bg-red-100";
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "PASS":
      return "text-green-600 bg-green-50 border-green-200";
    case "FAIL":
      return "text-red-600 bg-red-50 border-red-200";
    case "WARNING":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "MANUAL_REVIEW":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "SKIPPED":
      return "text-gray-500 bg-gray-50 border-gray-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case "PASS":
      return "✓";
    case "FAIL":
      return "✗";
    case "WARNING":
      return "⚠";
    case "MANUAL_REVIEW":
      return "👁";
    case "SKIPPED":
      return "−";
    default:
      return "?";
  }
}
