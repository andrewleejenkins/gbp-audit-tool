import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/audits - List all audits for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const locationId = searchParams.get("locationId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where = {
      userId: session.user.id,
      ...(locationId && { locationId }),
    };

    const [audits, total] = await Promise.all([
      prisma.audit.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          location: {
            select: {
              name: true,
              address: true,
            },
          },
          _count: {
            select: {
              results: true,
            },
          },
        },
      }),
      prisma.audit.count({ where }),
    ]);

    const auditList = audits.map((audit) => ({
      id: audit.id,
      locationId: audit.locationId,
      locationName: audit.location.name,
      locationAddress: audit.location.address,
      status: audit.status,
      overallScore: audit.overallScore,
      checkCount: audit._count.results,
      createdAt: audit.createdAt.toISOString(),
      completedAt: audit.completedAt?.toISOString(),
    }));

    return NextResponse.json({
      audits: auditList,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching audits:", error);
    return NextResponse.json(
      { error: "Failed to fetch audits" },
      { status: 500 }
    );
  }
}
