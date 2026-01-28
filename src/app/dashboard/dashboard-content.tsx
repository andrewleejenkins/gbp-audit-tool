"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Plus,
  MapPin,
  Clock,
  ChevronRight,
  LogOut,
  FileText,
} from "lucide-react";
import type { Location } from "@/types/audit";
import { formatDate, cn } from "@/lib/utils";

interface DashboardContentProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface AuditHistory {
  id: string;
  locationId: string;
  locationName: string;
  overallScore: number | null;
  createdAt: string;
  completedAt?: string;
}

export function DashboardContent({ user }: DashboardContentProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [recentAudits, setRecentAudits] = useState<AuditHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [locationsRes, auditsRes] = await Promise.all([
          fetch("/api/locations"),
          fetch("/api/audits?limit=5"),
        ]);

        if (locationsRes.ok) {
          const locationsData = await locationsRes.json();
          setLocations(locationsData);
        }

        if (auditsRes.ok) {
          const auditsData = await auditsRes.json();
          setRecentAudits(auditsData.audits || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const getScoreColor = (score: number | null) => {
    if (score === null) return "bg-gray-100 text-gray-600";
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl">GBP Audit Tool</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user.name || user.email}
              </span>
              {user.image && (
                <img
                  src={user.image}
                  alt="Profile"
                  className="h-8 w-8 rounded-full"
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage your locations and view audit history
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Locations */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Locations</CardTitle>
                    <CardDescription>
                      Manage your Google Business Profile locations
                    </CardDescription>
                  </div>
                  <Link href="/audit/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-1" />
                      New Audit
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-20 bg-gray-100 rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : locations.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-lg mb-2">No locations yet</h3>
                    <p className="text-gray-500 mb-4">
                      Add your first location to start auditing your Google
                      Business Profile.
                    </p>
                    <Link href="/audit/new">
                      <Button>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Your First Location
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {locations.map((location) => (
                      <Link
                        key={location.id}
                        href={`/audit/${location.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <MapPin className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">{location.name}</h4>
                              {location.address && (
                                <p className="text-sm text-gray-500">
                                  {location.address}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {location.lastAuditScore !== undefined && (
                              <Badge
                                className={cn(
                                  "text-sm",
                                  getScoreColor(location.lastAuditScore)
                                )}
                              >
                                {location.lastAuditScore}%
                              </Badge>
                            )}
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/audit/new" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    New Audit
                  </Button>
                </Link>
                <Link href="/audit/demo" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Try Demo Audit
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Audits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Audits</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-12 bg-gray-100 rounded animate-pulse"
                      />
                    ))}
                  </div>
                ) : recentAudits.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No audits yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentAudits.map((audit) => (
                      <Link
                        key={audit.id}
                        href={`/audit/${audit.locationId}/results/${audit.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="font-medium text-sm">
                              {audit.locationName}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {formatDate(audit.createdAt)}
                            </div>
                          </div>
                          {audit.overallScore !== null && (
                            <Badge
                              className={cn(
                                "text-xs",
                                getScoreColor(audit.overallScore)
                              )}
                            >
                              {audit.overallScore}%
                            </Badge>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {locations.length}
                    </p>
                    <p className="text-xs text-gray-500">Locations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {recentAudits.length}
                    </p>
                    <p className="text-xs text-gray-500">Audits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
