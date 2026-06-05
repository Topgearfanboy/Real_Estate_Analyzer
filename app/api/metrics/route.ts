import { NextRequest, NextResponse } from "next/server";
import { Block, ProjectSettings } from "@/types";
import { calculateGraphData } from "../build/helpers/graph";
import { calculateKeyMetrics } from "../build/helpers/metrics";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const blocks: Block[] = body.blocksJson ? JSON.parse(body.blocksJson) : [];
  const projectSettings: ProjectSettings = body.projectSettings || {
    years: 30,
    cashStrategy: "profit",
    idealCashHoldingBalance: 0,
    estimatedHomeAppreciationRate: 0,
    purchaseDate: new Date().toISOString().split("T")[0],
  };

  // Calculate graph data
  const graphData = calculateGraphData(
    blocks,
    projectSettings.years,
    projectSettings.cashStrategy,
    projectSettings.idealCashHoldingBalance,
    projectSettings.estimatedHomeAppreciationRate,
    projectSettings.purchaseDate,
  );

  // Calculate key metrics
  const metrics = calculateKeyMetrics(graphData);

  return NextResponse.json(
    {
      metrics,
      meta: {
        requestId: crypto.randomUUID(),
        timestamp: Date.now(),
      },
    },
    { status: 200 },
  );
}
