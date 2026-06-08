"use client";

import { useState, useEffect } from "react";
import type {
  Block,
  BlockType,
  BuyBlockData,
  ProjectSettings,
  RefinanceBlockData,
  RenovateBlockData,
  RentBlockData,
  SellBlockData,
} from "@/types";
import { BuyBlock } from "@/components/BuyBlock";
import { RenovateBlock } from "@/components/RenovateBlock";
import { RefinanceBlock } from "@/components/RefinanceBlock";
import { RentBlock } from "@/components/RentBlock";
import { SellBlock } from "@/components/SellBlock";
import {
  blockTypeLabels,
  blockTypeColors,
  getBlockDotColor,
} from "@/utils/blockHelpers";
import { LineGraph } from "@/components/uiComponents/LineGraph";
import { MetricCard } from "@/components/shared/MetricCard";
import { ProjectSettingsPanel } from "@/components/BuildPage/ProjectSettingsPanel";
import { useProjectSettings } from "@/hooks/useProjectSettings";
import { useBlockManager } from "@/hooks/useBlockManager";
import { calculateKeyMetrics } from "@/utils/metrics";

interface GraphDataPoint {
  date: string;
  investedCapital: number;
  cashOnHand: number;
  equity: number;
  remainingLoanBalance: number;
  monthlyNet: number;
}

export default function Build() {
  const {
    blocks,
    setBlocks,
    addBlock,
    removeBlock,
    moveBlock,
    updateBlockData,
    hasBuyBlock,
    hasSellBlock,
  } = useBlockManager();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [loanOverlapMonthsMap, setLoanOverlapMonthsMap] = useState<
    Record<number, number>
  >({});
  const {
    selectedYears,
    setSelectedYears,
    cashStrategy,
    setCashStrategy,
    idealCashHoldingBalance,
    setIdealCashHoldingBalance,
    estimatedHomeAppreciationRate,
    setEstimatedHomeAppreciationRate,
    purchaseDate,
    setPurchaseDate,
    getProjectSettings,
  } = useProjectSettings();
  const [metrics, setMetrics] = useState<{
    roi: number;
    cashOnCashReturn: number;
    timeToPayOffLoan: number | null;
    totalProfit: number;
    netPresentValue: number;
    annualizedRoi: number;
    capRate: number;
    netOperatingIncome: number;
    totalRoi: number;
  }>({
    roi: 0,
    cashOnCashReturn: 0,
    timeToPayOffLoan: null,
    totalProfit: 0,
    netPresentValue: 0,
    annualizedRoi: 0,
    capRate: 0,
    netOperatingIncome: 0,
    totalRoi: 0,
  });

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Compute metrics up to hovered index when hovering the graph
  const displayMetrics =
    hoveredIndex !== null && graphData.length > 0
      ? calculateKeyMetrics(graphData.slice(0, hoveredIndex + 1))
      : metrics;

  const hoveredTimeLabel =
    hoveredIndex !== null && graphData.length > 0
      ? (() => {
          const months = hoveredIndex + 1;
          const y = Math.floor(months / 12);
          const m = months % 12;
          if (y > 0 && m > 0) return `${y}y ${m}m`;
          if (y > 0) return `${y}y`;
          return `${m}m`;
        })()
      : null;

  // Sync blocks to API on every change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const syncBlocks = async () => {
      try {
        const projectSettings: ProjectSettings = {
          years: selectedYears,
          cashStrategy,
          idealCashHoldingBalance: parseFloat(idealCashHoldingBalance) || 0,
          estimatedHomeAppreciationRate:
            parseFloat(estimatedHomeAppreciationRate) || 0,
          purchaseDate,
        };

        const response = await fetch("/api/build", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blocksJson: JSON.stringify(blocks),
            projectSettings,
          }),
        });
        if (!response.ok) {
          throw new Error(
            `API error: ${response.status} ${response.statusText}`,
          );
        }
        const result = await response.json();
        console.log("API Response Debug:", result);
        if (result.debug) {
          console.log("Blocks Setup:", result.debug.blocks);
          // Update blocks state with calculated values from backend
          // Only update if the backend returned blocks with calculated refinance cost
          if (result.debug.blocks && result.debug.blocks.length > 0) {
            const hasCalculatedRefinance = result.debug.blocks.some(
              (b: any) =>
                b.type === "refinance" &&
                b.data?.cost &&
                parseFloat(b.data.cost) > 0,
            );
            if (hasCalculatedRefinance) {
              setBlocks((prevBlocks) => {
                // Merge calculated values into existing blocks to preserve IDs
                // Only return new array if something actually changed (avoid infinite loop)
                let changed = false;
                const updatedBlocks = prevBlocks.map((prevBlock) => {
                  const calculatedBlock = result.debug.blocks.find(
                    (cb: any) => cb.type === prevBlock.type,
                  );
                  if (
                    calculatedBlock &&
                    calculatedBlock.data &&
                    prevBlock.type === "refinance" &&
                    calculatedBlock.data.cost
                  ) {
                    const prevData = prevBlock.data as RefinanceBlockData;
                    if (
                      prevData.cost !== calculatedBlock.data.cost ||
                      prevData.costType !== calculatedBlock.data.costType
                    ) {
                      changed = true;
                      return {
                        ...prevBlock,
                        data: {
                          ...prevBlock.data,
                          cost: calculatedBlock.data.cost,
                          costType: calculatedBlock.data.costType,
                        },
                      };
                    }
                  }
                  return prevBlock;
                });
                return changed ? updatedBlocks : prevBlocks;
              });
            }
          }
        }
        if (result.graphData) {
          console.log("Graph Data Values:", result.graphData);
          setGraphData(result.graphData);
        }
        if (result.monthlyPayment !== undefined) {
          setMonthlyPayment(result.monthlyPayment);
        }
        if (result.loanOverlapMonthsMap) {
          setLoanOverlapMonthsMap(result.loanOverlapMonthsMap);
        }
      } catch (error) {
        console.error("Failed to sync blocks:", error);
        if (error instanceof Error) {
          console.error("Error details:", error.message);
        }
      }
    };

    if (blocks.length > 0) {
      void syncBlocks();
    }
  }, [
    blocks,
    selectedYears,
    cashStrategy,
    idealCashHoldingBalance,
    estimatedHomeAppreciationRate,
    purchaseDate,
  ]);

  // Calculate key metrics on every change
  useEffect(() => {
    const calculateMetrics = async () => {
      try {
        const projectSettings: ProjectSettings = {
          years: selectedYears,
          cashStrategy,
          idealCashHoldingBalance: parseFloat(idealCashHoldingBalance) || 0,
          estimatedHomeAppreciationRate:
            parseFloat(estimatedHomeAppreciationRate) || 0,
          purchaseDate,
        };

        const response = await fetch("/api/metrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blocksJson: JSON.stringify(blocks),
            projectSettings,
          }),
        });
        if (!response.ok) {
          throw new Error(
            `API error: ${response.status} ${response.statusText}`,
          );
        }
        const result = await response.json();
        if (result.metrics) {
          setMetrics(result.metrics);
        }
      } catch (error) {
        console.error("Failed to calculate metrics:", error);
        if (error instanceof Error) {
          console.error("Error details:", error.message);
        }
      }
    };

    if (blocks.length > 0) {
      void calculateMetrics();
    }
  }, [
    blocks,
    selectedYears,
    cashStrategy,
    idealCashHoldingBalance,
    estimatedHomeAppreciationRate,
    purchaseDate,
  ]);

  return (
    <div className="p-6">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">
            Property Manager
          </h1>
          <p className="text-text-muted">
            Create, organize, and manage your property investment
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ProjectSettingsPanel
            idealCashHoldingBalance={idealCashHoldingBalance}
            onCashBalanceChange={setIdealCashHoldingBalance}
            estimatedHomeAppreciationRate={estimatedHomeAppreciationRate}
            onAppreciationRateChange={setEstimatedHomeAppreciationRate}
            purchaseDate={purchaseDate}
            onPurchaseDateChange={setPurchaseDate}
            cashStrategy={cashStrategy}
            onCashStrategyChange={setCashStrategy}
          />
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors flex items-center gap-2 shadow-md"
              title="Add block"
              data-testid="add-block-button"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Add Block</span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-border py-2 z-50">
                <button
                  onClick={() => {
                    addBlock("buy");
                    setDropdownOpen(false);
                  }}
                  disabled={hasBuyBlock}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="add-buy-block"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Buy Block
                </button>
                <button
                  onClick={() => {
                    addBlock("renovate");
                    setDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  data-testid="add-renovate-block"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Renovate Block
                </button>
                <button
                  onClick={() => {
                    addBlock("refinance");
                    setDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  data-testid="add-refinance-block"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Refinance Block
                </button>
                <button
                  onClick={() => {
                    addBlock("rent");
                    setDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  data-testid="add-rent-block"
                >
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  Rent Block
                </button>
                <button
                  onClick={() => {
                    addBlock("sell");
                    setDropdownOpen(false);
                  }}
                  disabled={hasSellBlock}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  Sell Block
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-row gap-4 overflow-x-auto pb-4 items-start">
        {blocks.length === 0 && (
          <div className="w-full h-[calc(100vh-200px)] min-h-[400px] flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-border/60">
            <div className="text-center space-y-6 p-8">
              <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-sm flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-text-muted/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-text">
                  No blocks yet
                </h3>
                <p className="text-text-muted max-w-md">
                  Start building your real estate analysis by adding blocks
                  above. Add a Buy block to begin.
                </p>
              </div>
            </div>
          </div>
        )}

        {blocks.map((block, index) => (
          <div
            key={block.id}
            className={`bg-white rounded-xl shadow-sm border border-border border-l-4 ${blockTypeColors[block.type]} overflow-hidden min-w-[380px] max-w-[420px] flex-shrink-0`}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-border">
              <h3 className="font-semibold text-text flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${getBlockDotColor(block.type)}`}
                />
                {blockTypeLabels[block.type]} Block #{index + 1}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveBlock(index, "up")}
                  disabled={
                    index === 0 ||
                    blocks[index - 1]?.type === "buy" ||
                    block.type === "buy" ||
                    block.type === "sell"
                  }
                  className="p-2 text-text-muted hover:text-text hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                  title={
                    block.type === "buy" || block.type === "sell"
                      ? "Fixed position"
                      : "Move left"
                  }
                >
                  ←
                </button>
                <button
                  onClick={() => moveBlock(index, "down")}
                  disabled={
                    index === blocks.length - 1 ||
                    blocks[index + 1]?.type === "sell" ||
                    block.type === "buy" ||
                    block.type === "sell"
                  }
                  className="p-2 text-text-muted hover:text-text hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                  title={
                    block.type === "buy" || block.type === "sell"
                      ? "Fixed position"
                      : "Move right"
                  }
                >
                  →
                </button>
                <button
                  onClick={() => removeBlock(block.id)}
                  className="p-2 text-danger hover:bg-red-50 rounded-lg ml-2"
                  title="Delete block"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-4">
              {block.type === "buy" && (
                <BuyBlock
                  data={block.data as BuyBlockData}
                  onChange={(data) => updateBlockData(block.id, data)}
                />
              )}
              {block.type === "renovate" && (
                <RenovateBlock
                  data={block.data as RenovateBlockData}
                  onChange={(data) => updateBlockData(block.id, data)}
                  monthlyPayment={monthlyPayment}
                  loanOverlapMonths={loanOverlapMonthsMap[index] || 0}
                />
              )}
              {block.type === "refinance" && (
                <RefinanceBlock
                  data={block.data as RefinanceBlockData}
                  onChange={(data) => updateBlockData(block.id, data)}
                />
              )}
              {block.type === "rent" && (
                <RentBlock
                  data={block.data as RentBlockData}
                  onChange={(data) => updateBlockData(block.id, data)}
                />
              )}
              {block.type === "sell" && (
                <SellBlock
                  data={block.data as SellBlockData}
                  onChange={(data) => updateBlockData(block.id, data)}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-6">
        <div className="w-80 bg-white rounded-xl shadow-sm border border-border p-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text">Key Metrics</h3>
            {hoveredTimeLabel && (
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                as of {hoveredTimeLabel}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="ROI"
              value={displayMetrics.roi}
              format="percentage"
            />
            <MetricCard
              label="Annualized ROI"
              value={displayMetrics.annualizedRoi}
              format="percentage"
            />
            <MetricCard
              label="Cash on Cash Return"
              value={displayMetrics.cashOnCashReturn}
              format="percentage"
            />
            <MetricCard
              label="Cap Rate"
              value={displayMetrics.capRate}
              format="percentage"
            />
            <MetricCard
              label="NOI"
              value={displayMetrics.netOperatingIncome}
              format="currency"
            />
            <MetricCard
              label="Net Present Value"
              value={displayMetrics.netPresentValue}
              format="currency"
            />
            <MetricCard
              label="Time to Pay Off"
              value={metrics.timeToPayOffLoan}
              format="duration"
            />
            <MetricCard
              label="Total Profit"
              value={displayMetrics.totalProfit}
              format="currency"
            />
          </div>
        </div>
        <LineGraph
          data={graphData}
          selectedYears={selectedYears}
          onYearsChange={setSelectedYears}
          onHoverIndexChange={setHoveredIndex}
        />
      </div>
    </div>
  );
}
