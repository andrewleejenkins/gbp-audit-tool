"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { GBPProfileData, UserInputData, BusinessHours, ServiceArea } from "@/types/audit";

interface ProfileEntryFormProps {
  initialData?: Partial<GBPProfileData>;
  onSubmit: (profileData: GBPProfileData, userInputs: UserInputData) => void;
  isLoading?: boolean;
}

export function ProfileEntryForm({
  initialData,
  onSubmit,
  isLoading,
}: ProfileEntryFormProps) {
  // Profile Data State
  const [name, setName] = useState(initialData?.name || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [website, setWebsite] = useState(initialData?.website || "");
  const [appointmentLink, setAppointmentLink] = useState(initialData?.appointmentLink || "");

  // Categories
  const [primaryCategory, setPrimaryCategory] = useState(initialData?.primaryCategory || "");
  const [secondaryCategories, setSecondaryCategories] = useState(
    initialData?.secondaryCategories?.join(", ") || ""
  );

  // Description
  const [description, setDescription] = useState(initialData?.description || "");

  // Business Type & Service Areas
  const [businessType, setBusinessType] = useState<"storefront" | "service_area" | "hybrid">(
    initialData?.businessType || "storefront"
  );
  const [serviceAreas, setServiceAreas] = useState(
    initialData?.serviceAreas?.map((a) => a.name).join(", ") || ""
  );

  // Hours
  const [hasHours, setHasHours] = useState(!!initialData?.regularHours);

  // Counts (simplified for manual entry)
  const [serviceCount, setServiceCount] = useState(initialData?.services?.length || 0);
  const [servicesHaveDescriptions, setServicesHaveDescriptions] = useState(false);

  const [productCount, setProductCount] = useState(initialData?.products?.length || 0);
  const [productCategoryCount, setProductCategoryCount] = useState(
    initialData?.productCategories?.length || 0
  );
  const [productsHaveImages, setProductsHaveImages] = useState(false);
  const [productsHaveLandingPages, setProductsHaveLandingPages] = useState(false);

  const [photoCount, setPhotoCount] = useState(initialData?.photos?.length || 0);
  const [hasCoverPhoto, setHasCoverPhoto] = useState(!!initialData?.coverPhotoUrl);
  const [hasLogo, setHasLogo] = useState(!!initialData?.logoUrl);

  const [hasRecentPosts, setHasRecentPosts] = useState(
    (initialData?.recentPosts?.length || 0) > 0
  );
  const [daysSinceLastPost, setDaysSinceLastPost] = useState(0);

  const [reviewCount, setReviewCount] = useState(initialData?.reviewCount || 0);
  const [averageRating, setAverageRating] = useState(initialData?.averageRating || 0);
  const [reviewResponseRate, setReviewResponseRate] = useState(
    initialData?.reviewResponseRate || 0
  );

  // User Inputs
  const [targetKeyword, setTargetKeyword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse secondary categories
    const parsedSecondaryCategories = secondaryCategories
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    // Parse service areas
    const parsedServiceAreas: ServiceArea[] = serviceAreas
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean)
      .map((name) => ({
        name,
        type: name.toLowerCase().includes("county") ? "county" as const : "city" as const,
      }));

    // Build profile data
    const profileData: GBPProfileData = {
      name,
      address: address || undefined,
      phone: phone || undefined,
      website: website || undefined,
      appointmentLink: appointmentLink || undefined,
      primaryCategory: primaryCategory || undefined,
      secondaryCategories:
        parsedSecondaryCategories.length > 0 ? parsedSecondaryCategories : undefined,
      description: description || undefined,
      businessType,
      serviceAreas: parsedServiceAreas.length > 0 ? parsedServiceAreas : undefined,
      regularHours: hasHours
        ? {
            monday: { isOpen: true },
            tuesday: { isOpen: true },
            wednesday: { isOpen: true },
            thursday: { isOpen: true },
            friday: { isOpen: true },
            saturday: { isOpen: false },
            sunday: { isOpen: false },
          }
        : undefined,
      services: serviceCount > 0
        ? Array(serviceCount)
            .fill(null)
            .map((_, i) => ({
              name: `Service ${i + 1}`,
              description: servicesHaveDescriptions ? "Description provided" : undefined,
            }))
        : undefined,
      products: productCount > 0
        ? Array(productCount)
            .fill(null)
            .map((_, i) => ({
              name: `Product ${i + 1}`,
              imageUrl: productsHaveImages ? "https://example.com/image.jpg" : undefined,
              landingPageUrl: productsHaveLandingPages
                ? "https://example.com/product"
                : undefined,
            }))
        : undefined,
      productCategories:
        productCategoryCount > 0
          ? Array(productCategoryCount)
              .fill(null)
              .map((_, i) => `Category ${i + 1}`)
          : undefined,
      photos: photoCount > 0
        ? Array(photoCount)
            .fill(null)
            .map((_, i) => ({
              url: `https://example.com/photo${i + 1}.jpg`,
              type: "other" as const,
            }))
        : undefined,
      coverPhotoUrl: hasCoverPhoto ? "https://example.com/cover.jpg" : undefined,
      logoUrl: hasLogo ? "https://example.com/logo.jpg" : undefined,
      recentPosts: hasRecentPosts
        ? [
            {
              content: "Recent post",
              type: "update" as const,
              publishDate:
                daysSinceLastPost > 0
                  ? new Date(Date.now() - daysSinceLastPost * 24 * 60 * 60 * 1000).toISOString()
                  : new Date().toISOString(),
            },
          ]
        : undefined,
      reviewCount: reviewCount || undefined,
      averageRating: averageRating || undefined,
      reviewResponseRate: reviewResponseRate || undefined,
    };

    const userInputs: UserInputData = {
      targetKeyword: targetKeyword || undefined,
    };

    onSubmit(profileData, userInputs);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Enter your Google Business Profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointmentLink">Appointment Link</Label>
              <Input
                id="appointmentLink"
                type="url"
                value={appointmentLink}
                onChange={(e) => setAppointmentLink(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Your primary and secondary business categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primaryCategory">Primary Category</Label>
            <Input
              id="primaryCategory"
              value={primaryCategory}
              onChange={(e) => setPrimaryCategory(e.target.value)}
              placeholder="e.g., Plumber, Restaurant, Dentist"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondaryCategories">Secondary Categories</Label>
            <Input
              id="secondaryCategories"
              value={secondaryCategories}
              onChange={(e) => setSecondaryCategories(e.target.value)}
              placeholder="Comma-separated, e.g., Water Heater Repair, Drain Cleaning"
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple categories with commas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Business Description</CardTitle>
          <CardDescription>
            Your business description from Google Business Profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Paste your business description here..."
            />
            <p className="text-xs text-muted-foreground">
              {description.length} characters (recommended: 250-750)
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="targetKeyword">Target Keyword (for analysis)</Label>
            <Input
              id="targetKeyword"
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
              placeholder="e.g., plumber, dentist, pizza"
            />
            <p className="text-xs text-muted-foreground">
              We&apos;ll check if this keyword appears in optimal positions
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Service Areas */}
      <Card>
        <CardHeader>
          <CardTitle>Service Areas</CardTitle>
          <CardDescription>
            Configure your business type and service areas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Select
              value={businessType}
              onValueChange={(v) => setBusinessType(v as typeof businessType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="storefront">Storefront (customers visit)</SelectItem>
                <SelectItem value="service_area">Service Area (you visit customers)</SelectItem>
                <SelectItem value="hybrid">Hybrid (both)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(businessType === "service_area" || businessType === "hybrid") && (
            <div className="space-y-2">
              <Label htmlFor="serviceAreas">Service Areas</Label>
              <Textarea
                id="serviceAreas"
                value={serviceAreas}
                onChange={(e) => setServiceAreas(e.target.value)}
                rows={2}
                placeholder="City names, comma-separated, e.g., Austin, Round Rock, Cedar Park"
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 6-7 cities. Avoid counties.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Business Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasHours"
              checked={hasHours}
              onChange={(e) => setHasHours(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="hasHours">Business hours are configured in GBP</Label>
          </div>
        </CardContent>
      </Card>

      {/* Services & Products */}
      <Card>
        <CardHeader>
          <CardTitle>Services & Products</CardTitle>
          <CardDescription>
            Enter counts and characteristics from your GBP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-medium">Services</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="serviceCount">Number of Services</Label>
                <Input
                  id="serviceCount"
                  type="number"
                  min={0}
                  value={serviceCount}
                  onChange={(e) => setServiceCount(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="servicesHaveDescriptions"
                  checked={servicesHaveDescriptions}
                  onChange={(e) => setServicesHaveDescriptions(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="servicesHaveDescriptions">
                  Services have descriptions
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Products */}
          <div className="space-y-4">
            <h4 className="font-medium">Products</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="productCount">Number of Products</Label>
                <Input
                  id="productCount"
                  type="number"
                  min={0}
                  value={productCount}
                  onChange={(e) => setProductCount(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productCategoryCount">Number of Product Categories</Label>
                <Input
                  id="productCategoryCount"
                  type="number"
                  min={0}
                  value={productCategoryCount}
                  onChange={(e) =>
                    setProductCategoryCount(parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="productsHaveImages"
                  checked={productsHaveImages}
                  onChange={(e) => setProductsHaveImages(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="productsHaveImages">Products have images</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="productsHaveLandingPages"
                  checked={productsHaveLandingPages}
                  onChange={(e) => setProductsHaveLandingPages(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="productsHaveLandingPages">
                  Products have landing page links
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="photoCount">Total Photo Count</Label>
            <Input
              id="photoCount"
              type="number"
              min={0}
              value={photoCount}
              onChange={(e) => setPhotoCount(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasCoverPhoto"
                checked={hasCoverPhoto}
                onChange={(e) => setHasCoverPhoto(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="hasCoverPhoto">Cover photo is set</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasLogo"
                checked={hasLogo}
                onChange={(e) => setHasLogo(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="hasLogo">Logo is set</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasRecentPosts"
              checked={hasRecentPosts}
              onChange={(e) => setHasRecentPosts(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="hasRecentPosts">Has recent posts</Label>
          </div>
          {hasRecentPosts && (
            <div className="space-y-2">
              <Label htmlFor="daysSinceLastPost">Days since last post</Label>
              <Input
                id="daysSinceLastPost"
                type="number"
                min={0}
                value={daysSinceLastPost}
                onChange={(e) => setDaysSinceLastPost(parseInt(e.target.value) || 0)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="reviewCount">Total Reviews</Label>
              <Input
                id="reviewCount"
                type="number"
                min={0}
                value={reviewCount}
                onChange={(e) => setReviewCount(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="averageRating">Average Rating (1-5)</Label>
              <Input
                id="averageRating"
                type="number"
                min={1}
                max={5}
                step={0.1}
                value={averageRating || ""}
                onChange={(e) => setAverageRating(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviewResponseRate">Response Rate (%)</Label>
              <Input
                id="reviewResponseRate"
                type="number"
                min={0}
                max={100}
                value={reviewResponseRate || ""}
                onChange={(e) =>
                  setReviewResponseRate(parseInt(e.target.value) || 0)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isLoading || !name}>
          {isLoading ? "Running Audit..." : "Run Audit"}
        </Button>
      </div>
    </form>
  );
}
