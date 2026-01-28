"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AuditItem } from "./AuditItem";
import { cn } from "@/lib/utils";
import type { AuditCategoryResult, AuditSummary } from "@/types/audit";
import {
  FolderTree,
  FileText,
  MapPin,
  Clock,
  Phone,
  Wrench,
  ShoppingBag,
  Image,
  MessageSquare,
  Star,
} from "lucide-react";

interface AuditChecklistProps {
  audit: AuditSummary;
  className?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  categories: <FolderTree className="h-4 w-4" />,
  description: <FileText className="h-4 w-4" />,
  service_areas: <MapPin className="h-4 w-4" />,
  hours: <Clock className="h-4 w-4" />,
  contact: <Phone className="h-4 w-4" />,
  services: <Wrench className="h-4 w-4" />,
  products: <ShoppingBag className="h-4 w-4" />,
  photos: <Image className="h-4 w-4" />,
  posts: <MessageSquare className="h-4 w-4" />,
  reviews: <Star className="h-4 w-4" />,
};

function CategoryCard({ category }: { category: AuditCategoryResult }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const passCount = category.checks.filter((c) => c.status === "PASS").length;
  const failCount = category.checks.filter((c) => c.status === "FAIL").length;
  const warningCount = category.checks.filter(
    (c) => c.status === "WARNING"
  ).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {categoryIcons[category.category]}
            <CardTitle className="text-base">{category.displayName}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {category.hasManualReview && (
              <Badge variant="info" className="text-xs">
                Manual Review
              </Badge>
            )}
            <span className={cn("text-xl font-bold", getScoreColor(category.score))}>
              {category.score}%
            </span>
          </div>
        </div>
        <Progress
          value={category.score}
          className="h-1.5 mt-2"
          indicatorClassName={getProgressColor(category.score)}
        />
        <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
          {passCount > 0 && (
            <span className="text-green-600">{passCount} passed</span>
          )}
          {failCount > 0 && (
            <span className="text-red-600">{failCount} failed</span>
          )}
          {warningCount > 0 && (
            <span className="text-yellow-600">{warningCount} warnings</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {category.checks.map((check) => (
            <AuditItem key={check.checkId} result={check} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AuditChecklist({ audit, className }: AuditChecklistProps) {
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredCategories =
    activeTab === "all"
      ? audit.categories
      : activeTab === "issues"
      ? audit.categories.filter((c) =>
          c.checks.some((ch) => ch.status === "FAIL" || ch.status === "WARNING")
        )
      : activeTab === "manual"
      ? audit.categories.filter((c) => c.hasManualReview)
      : audit.categories;

  return (
    <div className={cn("space-y-6", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Categories</TabsTrigger>
          <TabsTrigger value="issues">
            Issues Only
            {audit.failCount + audit.warningCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {audit.failCount + audit.warningCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="manual">
            Manual Review
            {audit.manualReviewCount > 0 && (
              <Badge variant="info" className="ml-2">
                {audit.manualReviewCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-6">
            {filteredCategories.map((category) => (
              <CategoryCard key={category.category} category={category} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
