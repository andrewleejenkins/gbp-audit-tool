// GBP Profile Data Types (for manual entry and API response)
export interface GBPProfileData {
  // Basic Info
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  appointmentLink?: string;

  // Categories
  primaryCategory?: string;
  secondaryCategories?: string[];

  // Description
  description?: string;

  // Service Areas
  serviceAreas?: ServiceArea[];
  businessType?: 'storefront' | 'service_area' | 'hybrid';

  // Hours
  regularHours?: BusinessHours;
  specialHours?: SpecialHours[];

  // Services
  services?: Service[];

  // Products
  products?: Product[];
  productCategories?: string[];

  // Photos
  photos?: Photo[];
  coverPhotoUrl?: string;
  logoUrl?: string;

  // Posts
  recentPosts?: Post[];

  // Reviews
  reviewCount?: number;
  averageRating?: number;
  recentReviews?: Review[];
  reviewResponseRate?: number;
}

export interface ServiceArea {
  name: string;
  type: 'city' | 'county' | 'postal_code' | 'other';
  distanceFromPrimary?: number; // in minutes
}

export interface BusinessHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  openTime?: string; // "09:00"
  closeTime?: string; // "17:00"
  breaks?: { start: string; end: string }[];
}

export interface SpecialHours {
  date: string;
  isClosed: boolean;
  openTime?: string;
  closeTime?: string;
  label?: string;
}

export interface Service {
  name: string;
  description?: string;
  price?: string;
  category?: string;
}

export interface Product {
  name: string;
  description?: string;
  price?: string;
  category?: string;
  imageUrl?: string;
  landingPageUrl?: string;
}

export interface Photo {
  url: string;
  type: 'cover' | 'logo' | 'interior' | 'exterior' | 'product' | 'team' | 'other';
  uploadDate?: string;
}

export interface Post {
  content: string;
  type: 'update' | 'offer' | 'event' | 'product';
  publishDate: string;
  engagement?: {
    views?: number;
    clicks?: number;
  };
}

export interface Review {
  rating: number;
  text?: string;
  date: string;
  hasResponse: boolean;
}

// User Input Data (for manual review checks)
export interface UserInputData {
  targetKeyword?: string;
  websiteHours?: BusinessHours;
  expectedServiceAreas?: string[];
  businessDescription?: string;
}

// Audit Check Types
export type CheckStatus = 'PASS' | 'FAIL' | 'WARNING' | 'MANUAL_REVIEW' | 'SKIPPED';

export interface AuditCheckResult {
  checkId: string;
  checkName: string;
  category: AuditCategory;
  status: CheckStatus;
  score: number; // 0-100
  message?: string;
  details?: Record<string, unknown>;
  requiresManualReview: boolean;
  manualReviewNote?: string;
}

export type AuditCategory =
  | 'categories'
  | 'description'
  | 'service_areas'
  | 'hours'
  | 'contact'
  | 'services'
  | 'products'
  | 'photos'
  | 'posts'
  | 'reviews';

export interface AuditCategoryResult {
  category: AuditCategory;
  displayName: string;
  score: number;
  maxScore: number;
  checks: AuditCheckResult[];
  hasManualReview: boolean;
}

export interface AuditSummary {
  id: string;
  locationId: string;
  locationName: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  overallScore: number;
  maxScore: number;
  categories: AuditCategoryResult[];
  passCount: number;
  failCount: number;
  warningCount: number;
  manualReviewCount: number;
  createdAt: string;
  completedAt?: string;
}

// Check Definition (for building the audit engine)
export interface CheckDefinition {
  id: string;
  name: string;
  category: AuditCategory;
  description: string;
  weight: number; // Importance weighting 1-10
  automated: boolean;
  requiresUserInput?: string[]; // Which user inputs are needed
  check: (profile: GBPProfileData, userInputs?: UserInputData) => AuditCheckResult;
}

// Location Types
export interface Location {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  primaryCategory?: string;
  gbpAccountId?: string;
  gbpLocationId?: string;
  lastAuditDate?: string;
  lastAuditScore?: number;
}

// Form Types for Manual Entry
export interface ProfileFormData {
  // Basic Info
  name: string;
  address: string;
  phone: string;
  website: string;
  appointmentLink: string;

  // Categories
  primaryCategory: string;
  secondaryCategories: string;

  // Description
  description: string;

  // Service Areas
  serviceAreasRaw: string; // Comma-separated for simple input
  businessType: 'storefront' | 'service_area' | 'hybrid';

  // Hours (simplified for form)
  hasRegularHours: boolean;
  hoursJson: string; // JSON string for flexibility

  // Counts for simple checks
  serviceCount: number;
  servicesHaveDescriptions: boolean;

  productCount: number;
  productCategoryCount: number;
  productsHaveImages: boolean;
  productsHaveLandingPages: boolean;

  photoCount: number;
  hasCoverPhoto: boolean;
  hasLogo: boolean;

  // Posts
  hasRecentPosts: boolean;
  daysSinceLastPost: number;

  // Reviews
  reviewCount: number;
  averageRating: number;
  reviewResponseRate: number;
}

export interface UserInputFormData {
  targetKeyword: string;
  websiteHoursJson: string;
}
