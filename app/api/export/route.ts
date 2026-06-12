import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { Block, ProjectSettings } from "@/types";
import { calculateBuildData } from "../build/helpers/buildData";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const blocks: Block[] = body.blocks || [];
    const projectSettings: ProjectSettings = body.projectSettings || {
      years: 30,
      cashStrategy: "profit",
      idealCashHoldingBalance: 0,
      estimatedHomeAppreciationRate: 0,
      purchaseDate: new Date().toISOString().split("T")[0],
    };

    // Always use 50 years for the export
    const exportSettings: ProjectSettings = {
      ...projectSettings,
      years: 50,
    };

    const result = await calculateBuildData(blocks, exportSettings);
    const { graphData } = result;

    const workbook = XLSX.utils.book_new();

    // Summary sheet
    const summarySheet = XLSX.utils.aoa_to_sheet([
      ["Financial Analysis Export"],
      [],
      ["Project Settings"],
      ["Years", 50],
      ["Cash Strategy", projectSettings.cashStrategy],
      ["Ideal Cash Holding Balance", projectSettings.idealCashHoldingBalance],
      [
        "Estimated Home Appreciation Rate",
        projectSettings.estimatedHomeAppreciationRate,
      ],
      ["Purchase Date", projectSettings.purchaseDate],
      [],
      ["Blocks", blocks.length],
      ["Monthly Payment", result.monthlyPayment],
      ["Total Months", graphData.length],
    ]);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    // Timeseries sheet — rows = metric types, columns = months
    const headers = ["Metric", ...graphData.map((d) => d.date)];
    const timeseriesData = [
      headers,
      ["Cash on Hand", ...graphData.map((d) => d.cashOnHand)],
      ["Equity", ...graphData.map((d) => d.equity)],
      ["Invested Capital", ...graphData.map((d) => d.investedCapital)],
      [
        "Remaining Loan Balance",
        ...graphData.map((d) => d.remainingLoanBalance),
      ],
      ["Monthly Net", ...graphData.map((d) => d.monthlyNet)],
    ];
    const timeseriesSheet = XLSX.utils.aoa_to_sheet(timeseriesData);
    XLSX.utils.book_append_sheet(workbook, timeseriesSheet, "Timeseries");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="financial-analysis.xlsx"',
      },
    });
  } catch (error) {
    console.error("Error in /api/export:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
