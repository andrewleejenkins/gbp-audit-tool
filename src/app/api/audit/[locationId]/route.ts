import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runAudit } from "@/lib/audit-checks";
import type { GBPProfileData, UserInputData, AuditCheckResult } from "@/types/audit";

// POST /api/audit/[locationId] - Run an audit on a location
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ locationId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { locationId } = await params;

    // Verify the location belongs to the user
    const location = await prisma.location.findFirst({
      where: {
        id: locationId,
        userId: session.user.id,
      },
    });

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const body = await request.json();
    const { profileData, userInputs } = body as {
      profileData: GBPProfileData;
      userInputs?: UserInputData;
    };

    if (!profileData || !profileData.name) {
      return NextResponse.json(
        { error: "Profile data is required" },
        { status: 400 }
      );
    }

    // Create the audit record
    const audit = await prisma.audit.create({
      data: {
        userId: session.user.id,
        locationId,
        status: "IN_PROGRESS",
        profileData: profileData as object,
        userInputs: userInputs as object || {},
      },
    });

    // Run the audit
    const auditResult = runAudit(profileData, userInputs);

    // Save audit results
    const resultPromises = auditResult.categories.flatMap((category) =>
      category.checks.map((check: AuditCheckResult) =>
        prisma.auditResult.create({
          data: {
            auditId: audit.id,
            category: check.category,
            checkId: check.checkId,
            checkName: check.checkName,
            status: check.status,
            score: check.score,
            message: check.message,
            details: check.details as object || {},
            requiresManualReview: check.requiresManualReview,
            manualReviewNote: check.manualReviewNote,
          },
        })
      )
    );

    await Promise.all(resultPromises);

    // Update the audit with final score
    const updatedAudit = await prisma.audit.update({
      where: { id: audit.id },
      data: {
        status: "COMPLETED",
        overallScore: auditResult.overallScore,
        completedAt: new Date(),
      },
      include: {
        results: true,
      },
    });

    // Return the full audit summary
    return NextResponse.json({
      ...auditResult,
      id: updatedAudit.id,
      locationId,
      locationName: profileData.name,
    });
  } catch (error) {
    console.error("Error running audit:", error);
    return NextResponse.json(
      { error: "Failed to run audit" },
      { status: 500 }
    );
  }
}

// GET /api/audit/[locationId] - Get the latest audit for a location
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locationId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { locationId } = await params;

    // Verify the location belongs to the user
    const location = await prisma.location.findFirst({
      where: {
        id: locationId,
        userId: session.user.id,
      },
    });

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    // Get the latest audit
    const audit = await prisma.audit.findFirst({
      where: {
        locationId,
        userId: session.user.id,
      },
      orderBy: { createdAt: "desc" },
      include: {
        results: true,
      },
    });

    if (!audit) {
      return NextResponse.json(
        { error: "No audits found for this location" },
        { status: 404 }
      );
    }

    // Reconstruct the audit summary from stored results
    const profileData = audit.profileData as unknown as GBPProfileData;
    const userInputs = audit.userInputs as unknown as UserInputData;

    // Re-run the audit to get the full structure
    const auditSummary = runAudit(profileData, userInputs);

    return NextResponse.json({
      ...auditSummary,
      id: audit.id,
      locationId,
      locationName: location.name,
      createdAt: audit.createdAt.toISOString(),
      completedAt: audit.completedAt?.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching audit:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit" },
      { status: 500 }
    );
  }
}
