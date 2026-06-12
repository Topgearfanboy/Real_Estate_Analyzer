import { NextRequest, NextResponse } from "next/server";
import { Block, ProjectSettings } from "@/types";
import { calculateBuildData } from "./helpers/buildData";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const blocks: Block[] = body.blocksJson ? JSON.parse(body.blocksJson) : [];
    const projectSettings: ProjectSettings = body.projectSettings || {
      years: 30,
      cashStrategy: "profit",
      idealCashHoldingBalance: 0,
      estimatedHomeAppreciationRate: 0,
      purchaseDate: new Date().toISOString().split("T")[0],
    };

    const result = await calculateBuildData(blocks, projectSettings);

    console.log("Updating blocks:", result);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error in /api/build:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
