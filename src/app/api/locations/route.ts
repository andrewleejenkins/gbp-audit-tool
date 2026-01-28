import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/locations - List all locations for the current user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const locations = await prisma.location.findMany({
      where: { userId: session.user.id },
      include: {
        audits: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            overallScore: true,
            completedAt: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Transform to include last audit info
    const locationsWithAuditInfo = locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      address: loc.address,
      phone: loc.phone,
      website: loc.website,
      primaryCategory: loc.primaryCategory,
      gbpAccountId: loc.gbpAccountId,
      gbpLocationId: loc.gbpLocationId,
      lastAuditScore: loc.audits[0]?.overallScore || undefined,
      lastAuditDate: loc.audits[0]?.completedAt?.toISOString() || undefined,
    }));

    return NextResponse.json(locationsWithAuditInfo);
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}

// POST /api/locations - Create a new location
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, address, phone, website, primaryCategory } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Business name is required" },
        { status: 400 }
      );
    }

    const location = await prisma.location.create({
      data: {
        userId: session.user.id,
        name,
        address,
        phone,
        website,
        primaryCategory,
      },
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error("Error creating location:", error);
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 }
    );
  }
}
