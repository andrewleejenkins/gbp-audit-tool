"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore?: number;
  subtitle?: string;
  className?: string;
}

export function ScoreCard({
  title,
  score,
  maxScore = 100,
  subtitle,
  className,
}: ScoreCardProps) {
  const percentage = Math.round((score / maxScore) * 100);

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return "text-green-600";
    if (pct >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 80) return "bg-green-500";
    if (pct >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className={cn("text-4xl font-bold", getScoreColor(percentage))}>
            {percentage}
          </span>
          <span className="text-lg text-muted-foreground">/ 100</span>
        </div>
        <Progress
          value={percentage}
          className="mt-3 h-2"
          indicatorClassName={getProgressColor(percentage)}
        />
        {subtitle && (
          <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface ScoreSummaryProps {
  passCount: number;
  failCount: number;
  warningCount: number;
  manualReviewCount: number;
  className?: string;
}

export function ScoreSummary({
  passCount,
  failCount,
  warningCount,
  manualReviewCount,
  className,
}: ScoreSummaryProps) {
  return (
    <div className={cn("flex gap-4 flex-wrap", className)}>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-green-500" />
        <span className="text-sm">
          <span className="font-medium">{passCount}</span> Passed
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-red-500" />
        <span className="text-sm">
          <span className="font-medium">{failCount}</span> Failed
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-yellow-500" />
        <span className="text-sm">
          <span className="font-medium">{warningCount}</span> Warnings
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-blue-500" />
        <span className="text-sm">
          <span className="font-medium">{manualReviewCount}</span> Manual Review
        </span>
      </div>
    </div>
  );
}
