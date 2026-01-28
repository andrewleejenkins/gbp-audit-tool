"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AuditChecklist } from "@/components/AuditChecklist";
import { ScoreCard, ScoreSummary } from "@/components/ScoreCard";
import { BarChart3, ArrowLeft, Download, Share2 } from "lucide-react";
import type { AuditSummary } from "@/types/audit";
import { formatDateTime } from "@/lib/utils";

export default function AuditResultsPage() {
  const params = useParams();
  const locationId = params.locationId as string;
  const auditId = params.auditId as string;

  const [audit, setAudit] = useState<AuditSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAudit() {
      try {
        const res = await fetch(`/api/audit/${locationId}`);

        if (res.ok) {
          const data = await res.json();
          setAudit(data);
        } else {
          setError("Failed to load audit results");
        }
      } catch (err) {
        console.error("Error fetching audit:", err);
        setError("An error occurred while loading the audit");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAudit();
  }, [locationId, auditId]);

  const handleExport = () => {
    if (!audit) return;

    const exportData = {
      locationName: audit.locationName,
      overallScore: audit.overallScore,
      generatedAt: new Date().toISOString(),
      categories: audit.categories.map((cat) => ({
        name: cat.displayName,
        score: cat.score,
        checks: cat.checks.map((check) => ({
          name: check.checkName,
          status: check.status,
          score: check.score,
          message: check.message,
        })),
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gbp-audit-${audit.locationName.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading audit results...</p>
        </div>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Audit</h2>
            <p className="text-gray-600 mb-4">
              {error || "The audit could not be found."}
            </p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href={`/audit/${locationId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <span className="font-semibold">Audit Results</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">{audit.locationName}</h1>
            <p className="text-gray-600 mt-1">
              Audit completed on {formatDateTime(audit.completedAt || audit.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Link href={`/audit/${locationId}`}>
              <Button>Run New Audit</Button>
            </Link>
          </div>
        </div>

        {/* Score Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <ScoreCard
            title="Overall Score"
            score={audit.overallScore}
            subtitle={`Based on ${audit.categories.length} categories`}
            className="md:col-span-2"
          />
          <div className="md:col-span-2 bg-white rounded-xl border shadow p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Check Results
            </h3>
            <ScoreSummary
              passCount={audit.passCount}
              failCount={audit.failCount}
              warningCount={audit.warningCount}
              manualReviewCount={audit.manualReviewCount}
            />
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Total Checks:</span>{" "}
                  <span className="font-medium">
                    {audit.passCount +
                      audit.failCount +
                      audit.warningCount +
                      audit.manualReviewCount}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Categories:</span>{" "}
                  <span className="font-medium">{audit.categories.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Scores */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {audit.categories.map((category) => (
            <div
              key={category.category}
              className="bg-white rounded-lg border p-4 text-center"
            >
              <p className="text-xs text-gray-500 mb-1 truncate">
                {category.displayName}
              </p>
              <p
                className={`text-2xl font-bold ${
                  category.score >= 80
                    ? "text-green-600"
                    : category.score >= 60
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {category.score}%
              </p>
            </div>
          ))}
        </div>

        {/* Detailed Checklist */}
        <AuditChecklist audit={audit} />

        {/* Action Items Summary */}
        {(audit.failCount > 0 || audit.warningCount > 0) && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Priority Action Items</h3>
              <div className="space-y-3">
                {audit.categories
                  .flatMap((cat) => cat.checks)
                  .filter((check) => check.status === "FAIL")
                  .slice(0, 5)
                  .map((check) => (
                    <div
                      key={check.checkId}
                      className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200"
                    >
                      <div className="flex-shrink-0 text-red-600">✗</div>
                      <div>
                        <p className="font-medium text-red-800">
                          {check.checkName}
                        </p>
                        {check.message && (
                          <p className="text-sm text-red-700 mt-1">
                            {check.message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
