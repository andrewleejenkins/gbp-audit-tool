"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileEntryForm } from "@/components/ProfileEntryForm";
import { BarChart3, ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import type { GBPProfileData, UserInputData } from "@/types/audit";

type Step = "location" | "profile";

export default function NewAuditPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("location");
  const [isLoading, setIsLoading] = useState(false);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [locationData, setLocationData] = useState({
    name: "",
    address: "",
    phone: "",
    website: "",
    primaryCategory: "",
  });

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(locationData),
      });

      if (res.ok) {
        const location = await res.json();
        setLocationId(location.id);
        setStep("profile");
      } else {
        alert("Failed to create location. Please try again.");
      }
    } catch (error) {
      console.error("Error creating location:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuditSubmit = async (
    profileData: GBPProfileData,
    userInputs: UserInputData
  ) => {
    if (!locationId) return;

    setIsLoading(true);

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
      setIsLoading(false);
    }
  };

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
              <span className="font-semibold">New Audit</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-4">
            <div
              className={`flex items-center gap-2 ${
                step === "location" ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === "location"
                    ? "bg-blue-600 text-white"
                    : "bg-green-500 text-white"
                }`}
              >
                {step === "profile" ? "✓" : "1"}
              </div>
              <span className="font-medium">Location</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300" />
            <div
              className={`flex items-center gap-2 ${
                step === "profile" ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === "profile"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <span className="font-medium">Profile Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === "location" ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Information
              </CardTitle>
              <CardDescription>
                Enter the basic information about your business location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLocationSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name *</Label>
                  <Input
                    id="name"
                    value={locationData.name}
                    onChange={(e) =>
                      setLocationData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter your business name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={locationData.address}
                    onChange={(e) =>
                      setLocationData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="123 Main St, City, State"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={locationData.phone}
                      onChange={(e) =>
                        setLocationData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={locationData.website}
                      onChange={(e) =>
                        setLocationData((prev) => ({
                          ...prev,
                          website: e.target.value,
                        }))
                      }
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryCategory">Primary Category</Label>
                  <Input
                    id="primaryCategory"
                    value={locationData.primaryCategory}
                    onChange={(e) =>
                      setLocationData((prev) => ({
                        ...prev,
                        primaryCategory: e.target.value,
                      }))
                    }
                    placeholder="e.g., Plumber, Restaurant, Dentist"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isLoading || !locationData.name}>
                    {isLoading ? "Creating..." : "Continue to Profile Data"}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div>
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => setStep("location")}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Location
              </Button>
              <h2 className="text-2xl font-bold">
                Enter Profile Data for {locationData.name}
              </h2>
              <p className="text-gray-600 mt-1">
                Fill in the details from your Google Business Profile to run the
                audit
              </p>
            </div>
            <ProfileEntryForm
              initialData={{
                name: locationData.name,
                address: locationData.address,
                phone: locationData.phone,
                website: locationData.website,
                primaryCategory: locationData.primaryCategory,
              }}
              onSubmit={handleAuditSubmit}
              isLoading={isLoading}
            />
          </div>
        )}
      </main>
    </div>
  );
}
