"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProfileEntryForm } from "@/components/ProfileEntryForm";
import { AuditChecklist } from "@/components/AuditChecklist";
import { ScoreCard, ScoreSummary } from "@/components/ScoreCard";
import { runAudit } from "@/lib/audit-checks";
import { BarChart3, ArrowLeft, RotateCcw } from "lucide-react";
import type { GBPProfileData, UserInputData, AuditSummary } from "@/types/audit";

export default function DemoAuditPage() {
  const [auditResult, setAuditResult] = useState<AuditSummary | null>(null);

  const handleSubmit = (profileData: GBPProfileData, userInputs: UserInputData) => {
    const result = runAudit(profileData, userInputs);
    setAuditResult({
      ...result,
      id: "demo",
      locationId: "demo",
      locationName: profileData.name,
    });
  };

  const handleReset = () => {
    setAuditResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Home
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <span className="font-semibold">Demo Audit</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!auditResult ? (
          <div>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold">Try the GBP Audit Tool</h1>
              <p className="text-gray-600 mt-2">
                Enter your Google Business Profile data below to see how our audit
                tool works. No sign-in required.
              </p>
            </div>
            <ProfileEntryForm onSubmit={handleSubmit} />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">
                  Audit Results: {auditResult.locationName}
                </h1>
                <p className="text-gray-600 mt-1">
                  Demo audit - sign in to save your results
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  New Audit
                </Button>
                <Link href="/login">
                  <Button>Sign In to Save</Button>
                </Link>
              </div>
            </div>

            {/* Score Overview */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <ScoreCard
                title="Overall Score"
                score={auditResult.overallScore}
                className="md:col-span-2"
              />
              <div className="md:col-span-2 bg-white rounded-xl border shadow p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">
                  Check Results
                </h3>
                <ScoreSummary
                  passCount={auditResult.passCount}
                  failCount={auditResult.failCount}
                  warningCount={auditResult.warningCount}
                  manualReviewCount={auditResult.manualReviewCount}
                />
              </div>
            </div>

            {/* Category Scores */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              {auditResult.categories.map((category) => (
                <div
                  key={category.category}
                  className="bg-white rounded-lg border p-4 text-center"
                >
                  <p className="text-xs text-gray-500 mb-1">
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
            <AuditChecklist audit={auditResult} />
          </div>
        )}
      </main>
    </div>
  );
}
