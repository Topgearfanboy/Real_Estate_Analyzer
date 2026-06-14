import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { Property, Block, ProjectSettings } from "@/types";

// GET /api/properties/[id] - Get a single property
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const dbProperty = await prisma.property.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!dbProperty) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    const property: Property = {
      id: dbProperty.id,
      name: dbProperty.name,
      address: dbProperty.address || "",
      blocks: (dbProperty.blocks as Block[]) || [],
      projectSettings: {
        years: 30,
        cashStrategy: "profit",
        idealCashHoldingBalance: 10000,
        estimatedHomeAppreciationRate: 3,
        purchaseDate: new Date().toISOString().split("T")[0],
        ...(dbProperty.projectSettings as Partial<ProjectSettings>),
      },
      createdAt: dbProperty.createdAt.toISOString(),
      updatedAt: dbProperty.updatedAt.toISOString(),
    };

    return NextResponse.json({ property });
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 },
    );
  }
}

// PUT /api/properties/[id] - Update a property
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, address, blocks, projectSettings } = body;

    // Verify ownership
    const existingProperty = await prisma.property.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    const updateData: {
      name?: string;
      address?: string | null;
      blocks?: Block[];
      projectSettings?: ProjectSettings;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address || null;
    if (blocks !== undefined) updateData.blocks = blocks;
    if (projectSettings !== undefined)
      updateData.projectSettings = projectSettings;

    const dbProperty = await prisma.property.update({
      where: { id },
      data: updateData,
    });

    const property: Property = {
      id: dbProperty.id,
      name: dbProperty.name,
      address: dbProperty.address || "",
      blocks: (dbProperty.blocks as Block[]) || [],
      projectSettings: {
        years: 30,
        cashStrategy: "profit",
        idealCashHoldingBalance: 10000,
        estimatedHomeAppreciationRate: 3,
        purchaseDate: new Date().toISOString().split("T")[0],
        ...(dbProperty.projectSettings as Partial<ProjectSettings>),
      },
      createdAt: dbProperty.createdAt.toISOString(),
      updatedAt: dbProperty.updatedAt.toISOString(),
    };

    return NextResponse.json({ property });
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 },
    );
  }
}

// DELETE /api/properties/[id] - Delete a property
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existingProperty = await prisma.property.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    await prisma.property.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 },
    );
  }
}
