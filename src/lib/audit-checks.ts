import {
  GBPProfileData,
  UserInputData,
  AuditCheckResult,
  CheckDefinition,
  AuditCategory,
  AuditCategoryResult,
  AuditSummary,
} from '@/types/audit';

// Helper function to create check results
function createResult(
  checkId: string,
  checkName: string,
  category: AuditCategory,
  status: AuditCheckResult['status'],
  score: number,
  message?: string,
  details?: Record<string, unknown>,
  requiresManualReview = false,
  manualReviewNote?: string
): AuditCheckResult {
  return {
    checkId,
    checkName,
    category,
    status,
    score,
    message,
    details,
    requiresManualReview,
    manualReviewNote,
  };
}

// ==================== CATEGORY CHECKS ====================

const categoryChecks: CheckDefinition[] = [
  {
    id: 'primary_category_set',
    name: 'Primary category is set',
    category: 'categories',
    description: 'Check if a primary business category is configured',
    weight: 10,
    automated: true,
    check: (profile) => {
      const hasCategory = !!profile.primaryCategory?.trim();
      return createResult(
        'primary_category_set',
        'Primary category is set',
        'categories',
        hasCategory ? 'PASS' : 'FAIL',
        hasCategory ? 100 : 0,
        hasCategory
          ? `Primary category: ${profile.primaryCategory}`
          : 'No primary category set. This is critical for local search visibility.',
        { primaryCategory: profile.primaryCategory }
      );
    },
  },
  {
    id: 'secondary_categories_count',
    name: 'Has 1-3 secondary categories',
    category: 'categories',
    description: 'Check if profile has appropriate number of secondary categories',
    weight: 7,
    automated: true,
    check: (profile) => {
      const count = profile.secondaryCategories?.length || 0;
      let status: AuditCheckResult['status'] = 'PASS';
      let score = 100;
      let message = '';

      if (count === 0) {
        status = 'WARNING';
        score = 50;
        message = 'No secondary categories. Consider adding 1-3 relevant categories.';
      } else if (count > 3) {
        status = 'WARNING';
        score = 70;
        message = `${count} secondary categories may be excessive. Recommended: 1-3.`;
      } else {
        message = `${count} secondary categories configured (recommended range).`;
      }

      return createResult(
        'secondary_categories_count',
        'Has 1-3 secondary categories',
        'categories',
        status,
        score,
        message,
        { count, categories: profile.secondaryCategories }
      );
    },
  },
  {
    id: 'total_categories_reasonable',
    name: 'Total categories not excessive',
    category: 'categories',
    description: 'Flag if more than 4 total categories',
    weight: 5,
    automated: true,
    check: (profile) => {
      const total = 1 + (profile.secondaryCategories?.length || 0);
      const isExcessive = total > 4;

      return createResult(
        'total_categories_reasonable',
        'Total categories not excessive',
        'categories',
        isExcessive ? 'WARNING' : 'PASS',
        isExcessive ? 60 : 100,
        isExcessive
          ? `${total} total categories may dilute relevance. Consider removing less relevant ones.`
          : `${total} total categories (within recommended limit).`,
        { total }
      );
    },
  },
  {
    id: 'categories_match_services',
    name: 'Categories match service offerings',
    category: 'categories',
    description: 'Manual review to verify categories align with actual services',
    weight: 8,
    automated: false,
    check: (profile) => {
      return createResult(
        'categories_match_services',
        'Categories match service offerings',
        'categories',
        'MANUAL_REVIEW',
        0,
        'Review if selected categories accurately represent the business services.',
        { primaryCategory: profile.primaryCategory, secondaryCategories: profile.secondaryCategories },
        true,
        'Verify that selected categories accurately describe the services offered.'
      );
    },
  },
];

// ==================== DESCRIPTION CHECKS ====================

const descriptionChecks: CheckDefinition[] = [
  {
    id: 'description_exists',
    name: 'Business description exists',
    category: 'description',
    description: 'Check if business description is set',
    weight: 9,
    automated: true,
    check: (profile) => {
      const exists = !!profile.description?.trim();
      return createResult(
        'description_exists',
        'Business description exists',
        'description',
        exists ? 'PASS' : 'FAIL',
        exists ? 100 : 0,
        exists
          ? 'Business description is configured.'
          : 'No business description. Add a compelling description to improve visibility.'
      );
    },
  },
  {
    id: 'description_length',
    name: 'Description length (250-750 chars)',
    category: 'description',
    description: 'Check if description length is optimal',
    weight: 6,
    automated: true,
    check: (profile) => {
      const length = profile.description?.length || 0;
      let status: AuditCheckResult['status'] = 'PASS';
      let score = 100;
      let message = '';

      if (length === 0) {
        status = 'FAIL';
        score = 0;
        message = 'No description provided.';
      } else if (length < 250) {
        status = 'WARNING';
        score = 60;
        message = `Description is ${length} characters. Consider expanding to 250-750 characters.`;
      } else if (length > 750) {
        status = 'WARNING';
        score = 80;
        message = `Description is ${length} characters. Consider condensing to under 750 characters.`;
      } else {
        message = `Description length (${length} chars) is optimal.`;
      }

      return createResult(
        'description_length',
        'Description length (250-750 chars)',
        'description',
        status,
        score,
        message,
        { length }
      );
    },
  },
  {
    id: 'description_keyword_placement',
    name: 'Target keyword in first sentence',
    category: 'description',
    description: 'Check if target keyword appears in first sentence',
    weight: 8,
    automated: true,
    requiresUserInput: ['targetKeyword'],
    check: (profile, userInputs) => {
      if (!userInputs?.targetKeyword) {
        return createResult(
          'description_keyword_placement',
          'Target keyword in first sentence',
          'description',
          'SKIPPED',
          0,
          'Target keyword not provided. Enter your target keyword to check placement.',
          {},
          false
        );
      }

      const description = profile.description?.toLowerCase() || '';
      const keyword = userInputs.targetKeyword.toLowerCase();
      const firstSentence = description.split(/[.!?]/)[0] || '';
      const hasKeywordInFirst = firstSentence.includes(keyword);
      const hasKeywordAnywhere = description.includes(keyword);

      let status: AuditCheckResult['status'] = 'PASS';
      let score = 100;
      let message = '';

      if (hasKeywordInFirst) {
        message = `Target keyword "${userInputs.targetKeyword}" found in first sentence.`;
      } else if (hasKeywordAnywhere) {
        status = 'WARNING';
        score = 70;
        message = `Target keyword found but not in first sentence. Consider moving it earlier.`;
      } else {
        status = 'FAIL';
        score = 30;
        message = `Target keyword "${userInputs.targetKeyword}" not found in description.`;
      }

      return createResult(
        'description_keyword_placement',
        'Target keyword in first sentence',
        'description',
        status,
        score,
        message,
        { keyword: userInputs.targetKeyword, foundInFirst: hasKeywordInFirst, foundAnywhere: hasKeywordAnywhere }
      );
    },
  },
];

// ==================== SERVICE AREA CHECKS ====================

const serviceAreaChecks: CheckDefinition[] = [
  {
    id: 'service_areas_configured',
    name: 'Service areas are configured',
    category: 'service_areas',
    description: 'Check if service areas are set',
    weight: 8,
    automated: true,
    check: (profile) => {
      const hasAreas = (profile.serviceAreas?.length || 0) > 0;
      const isServiceArea = profile.businessType === 'service_area' || profile.businessType === 'hybrid';

      if (!isServiceArea) {
        return createResult(
          'service_areas_configured',
          'Service areas are configured',
          'service_areas',
          'SKIPPED',
          0,
          'Not a service-area business. This check does not apply.',
          { businessType: profile.businessType }
        );
      }

      return createResult(
        'service_areas_configured',
        'Service areas are configured',
        'service_areas',
        hasAreas ? 'PASS' : 'FAIL',
        hasAreas ? 100 : 0,
        hasAreas
          ? `${profile.serviceAreas?.length} service areas configured.`
          : 'No service areas configured for service-area business.',
        { count: profile.serviceAreas?.length || 0 }
      );
    },
  },
  {
    id: 'service_area_count',
    name: 'Service area count (6-7 recommended)',
    category: 'service_areas',
    description: 'Check if service area count is optimal',
    weight: 6,
    automated: true,
    check: (profile) => {
      const count = profile.serviceAreas?.length || 0;

      if (count === 0) {
        return createResult(
          'service_area_count',
          'Service area count (6-7 recommended)',
          'service_areas',
          'SKIPPED',
          0,
          'No service areas to evaluate.'
        );
      }

      let status: AuditCheckResult['status'] = 'PASS';
      let score = 100;
      let message = '';

      if (count < 6) {
        status = 'WARNING';
        score = 70;
        message = `${count} service areas. Consider adding more (6-7 recommended).`;
      } else if (count > 7) {
        status = 'WARNING';
        score = 60;
        message = `${count} service areas may be overloaded. Google recommends 6-7.`;
      } else {
        message = `${count} service areas (optimal range).`;
      }

      return createResult(
        'service_area_count',
        'Service area count (6-7 recommended)',
        'service_areas',
        status,
        score,
        message,
        { count }
      );
    },
  },
  {
    id: 'service_areas_are_cities',
    name: 'Service areas are cities (not counties)',
    category: 'service_areas',
    description: 'Check that service areas are cities, not counties',
    weight: 7,
    automated: true,
    check: (profile) => {
      const areas = profile.serviceAreas || [];
      if (areas.length === 0) {
        return createResult(
          'service_areas_are_cities',
          'Service areas are cities (not counties)',
          'service_areas',
          'SKIPPED',
          0,
          'No service areas to evaluate.'
        );
      }

      const countyAreas = areas.filter((a) => a.type === 'county');
      const hasCounties = countyAreas.length > 0;

      return createResult(
        'service_areas_are_cities',
        'Service areas are cities (not counties)',
        'service_areas',
        hasCounties ? 'WARNING' : 'PASS',
        hasCounties ? 50 : 100,
        hasCounties
          ? `${countyAreas.length} county-level areas detected. Cities are more specific and recommended.`
          : 'All service areas are city-level (recommended).',
        { countyCount: countyAreas.length, counties: countyAreas.map((a) => a.name) }
      );
    },
  },
  {
    id: 'service_area_distance',
    name: 'Service areas within 2-hour drive',
    category: 'service_areas',
    description: 'Flag service areas more than 2 hours from primary address',
    weight: 5,
    automated: true,
    check: (profile) => {
      const areas = profile.serviceAreas || [];
      if (areas.length === 0) {
        return createResult(
          'service_area_distance',
          'Service areas within 2-hour drive',
          'service_areas',
          'SKIPPED',
          0,
          'No service areas to evaluate.'
        );
      }

      const distantAreas = areas.filter((a) => a.distanceFromPrimary && a.distanceFromPrimary > 120);
      const hasDistant = distantAreas.length > 0;

      return createResult(
        'service_area_distance',
        'Service areas within 2-hour drive',
        'service_areas',
        hasDistant ? 'WARNING' : 'PASS',
        hasDistant ? 60 : 100,
        hasDistant
          ? `${distantAreas.length} service areas are >2 hours from primary location. This may seem unrealistic.`
          : 'All service areas are within reasonable distance.',
        { distantCount: distantAreas.length, distantAreas: distantAreas.map((a) => a.name) }
      );
    },
  },
];

// ==================== HOURS CHECKS ====================

const hoursChecks: CheckDefinition[] = [
  {
    id: 'hours_are_set',
    name: 'Business hours are set',
    category: 'hours',
    description: 'Check if regular hours are configured',
    weight: 9,
    automated: true,
    check: (profile) => {
      const hasHours = !!profile.regularHours && Object.keys(profile.regularHours).length > 0;
      return createResult(
        'hours_are_set',
        'Business hours are set',
        'hours',
        hasHours ? 'PASS' : 'FAIL',
        hasHours ? 100 : 0,
        hasHours
          ? 'Business hours are configured.'
          : 'No business hours set. This is important for customer expectations.'
      );
    },
  },
  {
    id: 'no_missing_days',
    name: 'No missing days in hours',
    category: 'hours',
    description: 'Check that all 7 days have hours or marked as closed',
    weight: 7,
    automated: true,
    check: (profile) => {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
      const hours = profile.regularHours || {};
      const missingDays = days.filter((day) => !hours[day]);

      if (Object.keys(hours).length === 0) {
        return createResult(
          'no_missing_days',
          'No missing days in hours',
          'hours',
          'SKIPPED',
          0,
          'No hours configured to evaluate.'
        );
      }

      return createResult(
        'no_missing_days',
        'No missing days in hours',
        'hours',
        missingDays.length > 0 ? 'WARNING' : 'PASS',
        missingDays.length > 0 ? 70 : 100,
        missingDays.length > 0
          ? `Missing hours for: ${missingDays.join(', ')}. Explicitly mark as closed if applicable.`
          : 'All days have hours configured.',
        { missingDays }
      );
    },
  },
  {
    id: 'hours_match_website',
    name: 'Hours match website',
    category: 'hours',
    description: 'Compare GBP hours with website hours',
    weight: 8,
    automated: true,
    requiresUserInput: ['websiteHours'],
    check: (profile, userInputs) => {
      if (!userInputs?.websiteHours) {
        return createResult(
          'hours_match_website',
          'Hours match website',
          'hours',
          'MANUAL_REVIEW',
          0,
          'Enter website hours to compare with GBP hours.',
          {},
          true,
          'Verify that GBP hours match the hours displayed on your website.'
        );
      }

      // Simple comparison - in production would be more sophisticated
      const gbpHours = JSON.stringify(profile.regularHours);
      const websiteHours = JSON.stringify(userInputs.websiteHours);
      const match = gbpHours === websiteHours;

      return createResult(
        'hours_match_website',
        'Hours match website',
        'hours',
        match ? 'PASS' : 'WARNING',
        match ? 100 : 50,
        match
          ? 'GBP hours match website hours.'
          : 'GBP hours may differ from website. Review for consistency.',
        { match }
      );
    },
  },
];

// ==================== CONTACT CHECKS ====================

const contactChecks: CheckDefinition[] = [
  {
    id: 'phone_is_set',
    name: 'Phone number is set',
    category: 'contact',
    description: 'Check if phone number is configured',
    weight: 9,
    automated: true,
    check: (profile) => {
      const hasPhone = !!profile.phone?.trim();
      return createResult(
        'phone_is_set',
        'Phone number is set',
        'contact',
        hasPhone ? 'PASS' : 'FAIL',
        hasPhone ? 100 : 0,
        hasPhone ? `Phone: ${profile.phone}` : 'No phone number configured.'
      );
    },
  },
  {
    id: 'website_is_set',
    name: 'Website URL is set',
    category: 'contact',
    description: 'Check if website URL is configured',
    weight: 9,
    automated: true,
    check: (profile) => {
      const hasWebsite = !!profile.website?.trim();
      return createResult(
        'website_is_set',
        'Website URL is set',
        'contact',
        hasWebsite ? 'PASS' : 'FAIL',
        hasWebsite ? 100 : 0,
        hasWebsite ? `Website: ${profile.website}` : 'No website URL configured.'
      );
    },
  },
  {
    id: 'appointment_link_set',
    name: 'Appointment link configured',
    category: 'contact',
    description: 'Check if appointment booking link is set',
    weight: 5,
    automated: true,
    check: (profile) => {
      const hasLink = !!profile.appointmentLink?.trim();
      return createResult(
        'appointment_link_set',
        'Appointment link configured',
        'contact',
        hasLink ? 'PASS' : 'WARNING',
        hasLink ? 100 : 70,
        hasLink
          ? 'Appointment link is configured.'
          : 'No appointment link. Consider adding if applicable to your business.'
      );
    },
  },
];

// ==================== SERVICES CHECKS ====================

const servicesChecks: CheckDefinition[] = [
  {
    id: 'services_added',
    name: 'Services are added',
    category: 'services',
    description: 'Check if services are configured',
    weight: 8,
    automated: true,
    check: (profile) => {
      const hasServices = (profile.services?.length || 0) > 0;
      return createResult(
        'services_added',
        'Services are added',
        'services',
        hasServices ? 'PASS' : 'WARNING',
        hasServices ? 100 : 40,
        hasServices
          ? `${profile.services?.length} services configured.`
          : 'No services added. Adding services helps customers understand your offerings.'
      );
    },
  },
  {
    id: 'service_count_optimal',
    name: 'Service count (5-15 recommended)',
    category: 'services',
    description: 'Check if service count is in optimal range',
    weight: 5,
    automated: true,
    check: (profile) => {
      const count = profile.services?.length || 0;

      if (count === 0) {
        return createResult(
          'service_count_optimal',
          'Service count (5-15 recommended)',
          'services',
          'SKIPPED',
          0,
          'No services to evaluate.'
        );
      }

      let status: AuditCheckResult['status'] = 'PASS';
      let score = 100;
      let message = '';

      if (count < 5) {
        status = 'WARNING';
        score = 70;
        message = `${count} services. Consider adding more (5-15 recommended).`;
      } else if (count > 15) {
        status = 'WARNING';
        score = 80;
        message = `${count} services may be overwhelming. Consider consolidating.`;
      } else {
        message = `${count} services (optimal range).`;
      }

      return createResult(
        'service_count_optimal',
        'Service count (5-15 recommended)',
        'services',
        status,
        score,
        message,
        { count }
      );
    },
  },
  {
    id: 'services_have_descriptions',
    name: 'Services have descriptions',
    category: 'services',
    description: 'Check if services have descriptions',
    weight: 6,
    automated: true,
    check: (profile) => {
      const services = profile.services || [];
      if (services.length === 0) {
        return createResult(
          'services_have_descriptions',
          'Services have descriptions',
          'services',
          'SKIPPED',
          0,
          'No services to evaluate.'
        );
      }

      const withDescriptions = services.filter((s) => s.description?.trim()).length;
      const percentage = Math.round((withDescriptions / services.length) * 100);

      return createResult(
        'services_have_descriptions',
        'Services have descriptions',
        'services',
        percentage >= 80 ? 'PASS' : percentage >= 50 ? 'WARNING' : 'FAIL',
        percentage,
        `${withDescriptions}/${services.length} services have descriptions (${percentage}%).`,
        { withDescriptions, total: services.length, percentage }
      );
    },
  },
];

// ==================== PRODUCTS CHECKS ====================

const productsChecks: CheckDefinition[] = [
  {
    id: 'products_added',
    name: 'Products are added',
    category: 'products',
    description: 'Check if products are configured',
    weight: 6,
    automated: true,
    check: (profile) => {
      const hasProducts = (profile.products?.length || 0) > 0;
      return createResult(
        'products_added',
        'Products are added',
        'products',
        hasProducts ? 'PASS' : 'WARNING',
        hasProducts ? 100 : 50,
        hasProducts
          ? `${profile.products?.length} products configured.`
          : 'No products added. Consider showcasing your products.'
      );
    },
  },
  {
    id: 'product_categories_reasonable',
    name: 'Product categories ≤ 4',
    category: 'products',
    description: 'Check product category count',
    weight: 4,
    automated: true,
    check: (profile) => {
      const count = profile.productCategories?.length || 0;
      if (count === 0) {
        return createResult(
          'product_categories_reasonable',
          'Product categories ≤ 4',
          'products',
          'SKIPPED',
          0,
          'No product categories to evaluate.'
        );
      }

      return createResult(
        'product_categories_reasonable',
        'Product categories ≤ 4',
        'products',
        count <= 4 ? 'PASS' : 'WARNING',
        count <= 4 ? 100 : 70,
        count <= 4
          ? `${count} product categories (within limit).`
          : `${count} product categories. Consider consolidating to 4 or fewer.`,
        { count }
      );
    },
  },
  {
    id: 'products_have_images',
    name: 'Products have images',
    category: 'products',
    description: 'Check if products have images',
    weight: 7,
    automated: true,
    check: (profile) => {
      const products = profile.products || [];
      if (products.length === 0) {
        return createResult(
          'products_have_images',
          'Products have images',
          'products',
          'SKIPPED',
          0,
          'No products to evaluate.'
        );
      }

      const withImages = products.filter((p) => p.imageUrl?.trim()).length;
      const percentage = Math.round((withImages / products.length) * 100);

      return createResult(
        'products_have_images',
        'Products have images',
        'products',
        percentage >= 80 ? 'PASS' : percentage >= 50 ? 'WARNING' : 'FAIL',
        percentage,
        `${withImages}/${products.length} products have images (${percentage}%).`,
        { withImages, total: products.length, percentage }
      );
    },
  },
  {
    id: 'products_have_landing_pages',
    name: 'Products have landing page links',
    category: 'products',
    description: 'Check if products link to landing pages',
    weight: 5,
    automated: true,
    check: (profile) => {
      const products = profile.products || [];
      if (products.length === 0) {
        return createResult(
          'products_have_landing_pages',
          'Products have landing page links',
          'products',
          'SKIPPED',
          0,
          'No products to evaluate.'
        );
      }

      const withLinks = products.filter((p) => p.landingPageUrl?.trim()).length;
      const percentage = Math.round((withLinks / products.length) * 100);

      return createResult(
        'products_have_landing_pages',
        'Products have landing page links',
        'products',
        percentage >= 80 ? 'PASS' : percentage >= 50 ? 'WARNING' : 'FAIL',
        percentage,
        `${withLinks}/${products.length} products have landing page links (${percentage}%).`,
        { withLinks, total: products.length, percentage }
      );
    },
  },
  {
    id: 'product_descriptions_keyword',
    name: 'Product descriptions start with keyword',
    category: 'products',
    description: 'Check if product descriptions start with target keyword',
    weight: 5,
    automated: true,
    requiresUserInput: ['targetKeyword'],
    check: (profile, userInputs) => {
      const products = profile.products || [];
      if (products.length === 0) {
        return createResult(
          'product_descriptions_keyword',
          'Product descriptions start with keyword',
          'products',
          'SKIPPED',
          0,
          'No products to evaluate.'
        );
      }

      if (!userInputs?.targetKeyword) {
        return createResult(
          'product_descriptions_keyword',
          'Product descriptions start with keyword',
          'products',
          'SKIPPED',
          0,
          'Target keyword not provided.'
        );
      }

      const keyword = userInputs.targetKeyword.toLowerCase();
      const withKeyword = products.filter((p) => {
        const desc = p.description?.toLowerCase() || '';
        return desc.startsWith(keyword) || desc.split(' ').slice(0, 3).join(' ').includes(keyword);
      }).length;

      const percentage = Math.round((withKeyword / products.length) * 100);

      return createResult(
        'product_descriptions_keyword',
        'Product descriptions start with keyword',
        'products',
        percentage >= 50 ? 'PASS' : 'WARNING',
        percentage,
        `${withKeyword}/${products.length} product descriptions include keyword near start.`,
        { withKeyword, total: products.length, keyword: userInputs.targetKeyword }
      );
    },
  },
];

// ==================== PHOTOS CHECKS ====================

const photosChecks: CheckDefinition[] = [
  {
    id: 'has_photos',
    name: 'Profile has photos',
    category: 'photos',
    description: 'Check if profile has any photos',
    weight: 8,
    automated: true,
    check: (profile) => {
      const hasPhotos = (profile.photos?.length || 0) > 0;
      return createResult(
        'has_photos',
        'Profile has photos',
        'photos',
        hasPhotos ? 'PASS' : 'FAIL',
        hasPhotos ? 100 : 0,
        hasPhotos
          ? `${profile.photos?.length} photos on profile.`
          : 'No photos on profile. Photos significantly impact engagement.'
      );
    },
  },
  {
    id: 'photo_count_optimal',
    name: 'Photo count (10+ recommended)',
    category: 'photos',
    description: 'Check if photo count is sufficient',
    weight: 6,
    automated: true,
    check: (profile) => {
      const count = profile.photos?.length || 0;

      if (count === 0) {
        return createResult(
          'photo_count_optimal',
          'Photo count (10+ recommended)',
          'photos',
          'FAIL',
          0,
          'No photos. Add at least 10 high-quality photos.'
        );
      }

      return createResult(
        'photo_count_optimal',
        'Photo count (10+ recommended)',
        'photos',
        count >= 10 ? 'PASS' : 'WARNING',
        count >= 10 ? 100 : Math.round((count / 10) * 100),
        count >= 10
          ? `${count} photos (meets recommendation).`
          : `${count} photos. Consider adding more (10+ recommended).`,
        { count }
      );
    },
  },
  {
    id: 'cover_photo_set',
    name: 'Cover photo is set',
    category: 'photos',
    description: 'Check if cover photo is configured',
    weight: 7,
    automated: true,
    check: (profile) => {
      const hasCover = !!profile.coverPhotoUrl || profile.photos?.some((p) => p.type === 'cover');
      return createResult(
        'cover_photo_set',
        'Cover photo is set',
        'photos',
        hasCover ? 'PASS' : 'FAIL',
        hasCover ? 100 : 0,
        hasCover ? 'Cover photo is set.' : 'No cover photo. This is the first image customers see.'
      );
    },
  },
  {
    id: 'logo_set',
    name: 'Logo is set',
    category: 'photos',
    description: 'Check if logo is configured',
    weight: 7,
    automated: true,
    check: (profile) => {
      const hasLogo = !!profile.logoUrl || profile.photos?.some((p) => p.type === 'logo');
      return createResult(
        'logo_set',
        'Logo is set',
        'photos',
        hasLogo ? 'PASS' : 'FAIL',
        hasLogo ? 100 : 0,
        hasLogo ? 'Logo is set.' : 'No logo configured. Add your business logo for brand recognition.'
      );
    },
  },
];

// ==================== POSTS CHECKS ====================

const postsChecks: CheckDefinition[] = [
  {
    id: 'has_recent_posts',
    name: 'Has recent posts',
    category: 'posts',
    description: 'Check if profile has recent posts',
    weight: 7,
    automated: true,
    check: (profile) => {
      const posts = profile.recentPosts || [];
      const hasPosts = posts.length > 0;

      return createResult(
        'has_recent_posts',
        'Has recent posts',
        'posts',
        hasPosts ? 'PASS' : 'WARNING',
        hasPosts ? 100 : 40,
        hasPosts
          ? `${posts.length} recent posts found.`
          : 'No recent posts. Regular posting improves engagement.'
      );
    },
  },
  {
    id: 'posting_frequency',
    name: 'Posted within last 30 days',
    category: 'posts',
    description: 'Check posting frequency',
    weight: 6,
    automated: true,
    check: (profile) => {
      const posts = profile.recentPosts || [];
      if (posts.length === 0) {
        return createResult(
          'posting_frequency',
          'Posted within last 30 days',
          'posts',
          'WARNING',
          30,
          'No posts found. Aim to post at least once every 30 days.'
        );
      }

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentPost = posts.find((p) => new Date(p.publishDate) > thirtyDaysAgo);

      return createResult(
        'posting_frequency',
        'Posted within last 30 days',
        'posts',
        recentPost ? 'PASS' : 'WARNING',
        recentPost ? 100 : 50,
        recentPost
          ? 'Posted within the last 30 days.'
          : 'No posts in the last 30 days. Consider posting more frequently.'
      );
    },
  },
];

// ==================== REVIEWS CHECKS ====================

const reviewsChecks: CheckDefinition[] = [
  {
    id: 'review_count',
    name: 'Review count',
    category: 'reviews',
    description: 'Informational check on review count',
    weight: 5,
    automated: true,
    check: (profile) => {
      const count = profile.reviewCount || 0;

      return createResult(
        'review_count',
        'Review count',
        'reviews',
        count >= 10 ? 'PASS' : count > 0 ? 'WARNING' : 'FAIL',
        count >= 10 ? 100 : count > 0 ? 60 : 20,
        `${count} reviews. ${count < 10 ? 'Work on getting more reviews.' : 'Good review count.'}`,
        { count }
      );
    },
  },
  {
    id: 'average_rating',
    name: 'Average rating',
    category: 'reviews',
    description: 'Check average review rating',
    weight: 7,
    automated: true,
    check: (profile) => {
      const rating = profile.averageRating || 0;

      if (rating === 0) {
        return createResult(
          'average_rating',
          'Average rating',
          'reviews',
          'SKIPPED',
          0,
          'No reviews to calculate rating.'
        );
      }

      let status: AuditCheckResult['status'] = 'PASS';
      let score = 100;

      if (rating < 4.0) {
        status = 'FAIL';
        score = 40;
      } else if (rating < 4.5) {
        status = 'WARNING';
        score = 70;
      }

      return createResult(
        'average_rating',
        'Average rating',
        'reviews',
        status,
        score,
        `Average rating: ${rating.toFixed(1)} stars.`,
        { rating }
      );
    },
  },
  {
    id: 'review_response_rate',
    name: 'Review response rate',
    category: 'reviews',
    description: 'Check how often owner responds to reviews',
    weight: 6,
    automated: true,
    check: (profile) => {
      const rate = profile.reviewResponseRate;

      if (rate === undefined) {
        return createResult(
          'review_response_rate',
          'Review response rate',
          'reviews',
          'MANUAL_REVIEW',
          0,
          'Review response rate not available.',
          {},
          true,
          'Check if you are responding to customer reviews.'
        );
      }

      return createResult(
        'review_response_rate',
        'Review response rate',
        'reviews',
        rate >= 80 ? 'PASS' : rate >= 50 ? 'WARNING' : 'FAIL',
        rate,
        `Response rate: ${rate}%. ${rate < 80 ? 'Try to respond to more reviews.' : 'Great response rate!'}`,
        { rate }
      );
    },
  },
];

// ==================== ALL CHECKS ====================

export const allChecks: CheckDefinition[] = [
  ...categoryChecks,
  ...descriptionChecks,
  ...serviceAreaChecks,
  ...hoursChecks,
  ...contactChecks,
  ...servicesChecks,
  ...productsChecks,
  ...photosChecks,
  ...postsChecks,
  ...reviewsChecks,
];

// ==================== AUDIT ENGINE ====================

const categoryDisplayNames: Record<AuditCategory, string> = {
  categories: 'Categories',
  description: 'Company Description',
  service_areas: 'Service Areas',
  hours: 'Business Hours',
  contact: 'Contact Information',
  services: 'Services',
  products: 'Products',
  photos: 'Photos',
  posts: 'Posts',
  reviews: 'Reviews',
};

export function runAudit(
  profile: GBPProfileData,
  userInputs?: UserInputData
): AuditSummary {
  const results: AuditCheckResult[] = [];

  // Run all checks
  for (const check of allChecks) {
    const result = check.check(profile, userInputs);
    results.push(result);
  }

  // Group by category
  const categories: AuditCategory[] = [
    'categories',
    'description',
    'service_areas',
    'hours',
    'contact',
    'services',
    'products',
    'photos',
    'posts',
    'reviews',
  ];

  const categoryResults: AuditCategoryResult[] = categories.map((cat) => {
    const catChecks = results.filter((r) => r.category === cat);
    const catCheckDefs = allChecks.filter((c) => c.category === cat);

    // Calculate weighted score
    let weightedScore = 0;
    let totalWeight = 0;

    catChecks.forEach((check) => {
      const def = catCheckDefs.find((d) => d.id === check.checkId);
      const weight = def?.weight || 1;
      if (check.status !== 'SKIPPED' && check.status !== 'MANUAL_REVIEW') {
        weightedScore += check.score * weight;
        totalWeight += weight * 100;
      }
    });

    const score = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;

    return {
      category: cat,
      displayName: categoryDisplayNames[cat],
      score,
      maxScore: 100,
      checks: catChecks,
      hasManualReview: catChecks.some((c) => c.requiresManualReview),
    };
  });

  // Calculate overall score
  const totalScore = categoryResults.reduce((sum, cat) => sum + cat.score, 0);
  const overallScore = Math.round(totalScore / categoryResults.length);

  // Count statuses
  const passCount = results.filter((r) => r.status === 'PASS').length;
  const failCount = results.filter((r) => r.status === 'FAIL').length;
  const warningCount = results.filter((r) => r.status === 'WARNING').length;
  const manualReviewCount = results.filter((r) => r.status === 'MANUAL_REVIEW').length;

  return {
    id: '', // Will be set by database
    locationId: '',
    locationName: profile.name,
    status: 'COMPLETED',
    overallScore,
    maxScore: 100,
    categories: categoryResults,
    passCount,
    failCount,
    warningCount,
    manualReviewCount,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
}

export function getChecksByCategory(category: AuditCategory): CheckDefinition[] {
  return allChecks.filter((c) => c.category === category);
}

export function getCheckById(id: string): CheckDefinition | undefined {
  return allChecks.find((c) => c.id === id);
}
