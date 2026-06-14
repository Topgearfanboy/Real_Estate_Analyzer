import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { Property, Block, ProjectSettings } from "@/types";

// GET /api/properties - List all properties for the current user
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbProperties = await prisma.property.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
    });

    // Transform DB properties to match our Property type
    const properties: Property[] = dbProperties.map(
      (dbProp: Record<string, unknown>) => ({
        id: dbProp.id as string,
        name: dbProp.name as string,
        address: (dbProp.address as string) || "",
        blocks: (dbProp.blocks as Block[]) || [],
        projectSettings: {
          years: 30,
          cashStrategy: "profit",
          idealCashHoldingBalance: 10000,
          estimatedHomeAppreciationRate: 3,
          purchaseDate: new Date().toISOString().split("T")[0],
          ...(dbProp.projectSettings as Partial<ProjectSettings>),
        },
        createdAt: (dbProp.createdAt as Date).toISOString(),
        updatedAt: (dbProp.updatedAt as Date).toISOString(),
      }),
    );

    return NextResponse.json({ properties });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 },
    );
  }
}

// POST /api/properties - Create a new property
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, address } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Property name is required" },
        { status: 400 },
      );
    }

    const dbProperty = await prisma.property.create({
      data: {
        name: name.trim(),
        address: address?.trim() || null,
        userId: user.userId,
        blocks: [],
        projectSettings: {
          years: 30,
          cashStrategy: "profit",
          idealCashHoldingBalance: 10000,
          estimatedHomeAppreciationRate: 3,
          purchaseDate: new Date().toISOString().split("T")[0],
        },
      },
    });

    const property: Property = {
      id: dbProperty.id,
      name: dbProperty.name,
      address: dbProperty.address || "",
      blocks: [],
      projectSettings: {
        years: 30,
        cashStrategy: "profit",
        idealCashHoldingBalance: 10000,
        estimatedHomeAppreciationRate: 3,
        purchaseDate: new Date().toISOString().split("T")[0],
      },
      createdAt: dbProperty.createdAt.toISOString(),
      updatedAt: dbProperty.updatedAt.toISOString(),
    };

    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 },
    );
  }
}
