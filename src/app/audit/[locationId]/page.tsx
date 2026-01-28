"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileEntryForm } from "@/components/ProfileEntryForm";
import { BarChart3, ArrowLeft, MapPin, Clock, Plus } from "lucide-react";
import type { GBPProfileData, UserInputData, Location } from "@/types/audit";
import { formatDate, cn } from "@/lib/utils";

interface AuditHistory {
  id: string;
  overallScore: number | null;
  createdAt: string;
  completedAt?: string;
}

export default function LocationAuditPage() {
  const params = useParams();
  const router = useRouter();
  const locationId = params.locationId as string;

  const [location, setLocation] = useState<Location | null>(null);
  const [auditHistory, setAuditHistory] = useState<AuditHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuditing, setIsAuditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [locationsRes, auditsRes] = await Promise.all([
          fetch("/api/locations"),
          fetch(`/api/audits?locationId=${locationId}`),
        ]);

        if (locationsRes.ok) {
          const locations = await locationsRes.json();
          const loc = locations.find((l: Location) => l.id === locationId);
          setLocation(loc || null);
        }

        if (auditsRes.ok) {
          const data = await auditsRes.json();
          setAuditHistory(data.audits || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [locationId]);

  const handleAuditSubmit = async (
    profileData: GBPProfileData,
    userInputs: UserInputData
  ) => {
    setIsAuditing(true);

    try {
      const res = await fetch(`/api/audit/${locationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileData, userInputs }),
      });

      if (res.ok) {
        const auditResult = await res.json();
        router.push(`/audit/${locationId}/results/${auditResult.id}`);
      } else {
        alert("Failed to run audit. Please try again.");
      }
    } catch (error) {
      console.error("Error running audit:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsAuditing(false);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "bg-gray-100 text-gray-600";
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Location Not Found</h2>
            <p className="text-gray-600 mb-4">
              The location you are looking for does not exist or you do not have
              access to it.
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <span className="font-semibold">Location Audit</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Location Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{location.name}</h1>
                  {location.address && (
                    <p className="text-gray-600">{location.address}</p>
                  )}
                  {location.primaryCategory && (
                    <Badge variant="outline" className="mt-2">
                      {location.primaryCategory}
                    </Badge>
                  )}
                </div>
              </div>
              {!showForm && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  New Audit
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {showForm ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Run New Audit</h2>
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
            <ProfileEntryForm
              initialData={{
                name: location.name,
                address: location.address || undefined,
                phone: location.phone || undefined,
                website: location.website || undefined,
                primaryCategory: location.primaryCategory || undefined,
              }}
              onSubmit={handleAuditSubmit}
              isLoading={isAuditing}
            />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Audit History</CardTitle>
              <CardDescription>
                Previous audits for this location
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-lg mb-2">No audits yet</h3>
                  <p className="text-gray-500 mb-4">
                    Run your first audit to see how your profile is performing.
                  </p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Run First Audit
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditHistory.map((audit) => (
                    <Link
                      key={audit.id}
                      href={`/audit/${locationId}/results/${audit.id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">
                              {formatDate(audit.createdAt)}
                            </span>
                          </div>
                        </div>
                        <Badge
                          className={cn("text-sm", getScoreColor(audit.overallScore))}
                        >
                          {audit.overallScore !== null
                            ? `${audit.overallScore}%`
                            : "In Progress"}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
