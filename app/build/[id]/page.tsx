"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type {
  Block,
  BlockType,
  BuyBlockData,
  ProjectSettings,
  RefinanceBlockData,
  RenovateBlockData,
  RentBlockData,
  SellBlockData,
  Property,
} from "@/types";
import { BuyBlock } from "@/components/BuyBlock";
import { RenovateBlock } from "@/components/RenovateBlock";
import { RefinanceBlock } from "@/components/RefinanceBlock";
import { RentBlock } from "@/components/RentBlock";
import { SellBlock } from "@/components/SellBlock";
import { createBlock } from "@/defaultData";
import { blockTypeLabels, blockTypeColors, getBlockDotColor } from "../helpers";
import { LineGraph } from "@/components/uiComponents/LineGraph";
import { calculateKeyMetrics } from "@/utils/metrics";
import { getPropertyById, saveProperty } from "@/utils/propertyStorage";

interface GraphDataPoint {
  date: string;
  investedCapital: number;
  cashOnHand: number;
  equity: number;
  remainingLoanBalance: number;
  monthlyNet: number;
}

export default function BuildProperty() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);
  const [selectedYears, setSelectedYears] = useState(30);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [loanOverlapMonthsMap, setLoanOverlapMonthsMap] = useState<
    Record<number, number>
  >({});
  const [idealCashHoldingBalance, setIdealCashHoldingBalance] =
    useState("10000");
  const [cashStrategy, setCashStrategy] = useState<"profit" | "paydown">(
    "profit",
  );
  const [estimatedHomeAppreciationRate, setEstimatedHomeAppreciationRate] =
    useState("3");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0],
  );
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProperty = () => {
      const loaded = getPropertyById(propertyId);
      if (!loaded) {
        router.push("/");
        return;
      }

      setProperty(loaded);
      setBlocks(loaded.blocks);
      setSelectedYears(loaded.projectSettings.years);
      setCashStrategy(loaded.projectSettings.cashStrategy);
      setIdealCashHoldingBalance(
        loaded.projectSettings.idealCashHoldingBalance.toString(),
      );
      setEstimatedHomeAppreciationRate(
        loaded.projectSettings.estimatedHomeAppreciationRate.toString(),
      );
      setPurchaseDate(loaded.projectSettings.purchaseDate);
      setIsLoading(false);
    };

    loadProperty();
  }, [propertyId, router]);

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

  const hasBuyBlock = blocks.some((b) => b.type === "buy");
  const hasSellBlock = blocks.some((b) => b.type === "sell");
  const sellBlockIndex = blocks.findIndex((b) => b.type === "sell");

  const addBlock = (type: BlockType) => {
    if (type === "buy" && hasBuyBlock) return;
    if (type === "sell" && hasSellBlock) return;

    const newBlock = createBlock(type);

    if (type === "buy") {
      setBlocks([newBlock, ...blocks]);
    } else {
      let insertIndex = blocks.length;
      if (hasSellBlock) insertIndex = sellBlockIndex;
      const newBlocks = [...blocks];
      newBlocks.splice(insertIndex, 0, newBlock);
      setBlocks(newBlocks);
    }
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const block = blocks[index];
    if (block.type === "buy") return;
    if (block.type === "sell") return;

    if (direction === "up" && index > 0) {
      if (blocks[index - 1].type === "buy") return;
      const newBlocks = [...blocks];
      [newBlocks[index - 1], newBlocks[index]] = [
        newBlocks[index],
        newBlocks[index - 1],
      ];
      setBlocks(newBlocks);
    } else if (direction === "down" && index < blocks.length - 1) {
      if (blocks[index + 1].type === "sell") return;
      const newBlocks = [...blocks];
      [newBlocks[index], newBlocks[index + 1]] = [
        newBlocks[index + 1],
        newBlocks[index],
      ];
      setBlocks(newBlocks);
    }
  };

  const updateBlockData = (id: string, data: Block["data"]) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, data } : b)));
  };

  useEffect(() => {
    if (property) {
      const updatedProperty: Property = {
        ...property,
        blocks,
        projectSettings: {
          years: selectedYears,
          cashStrategy,
          idealCashHoldingBalance: parseFloat(idealCashHoldingBalance) || 0,
          estimatedHomeAppreciationRate:
            parseFloat(estimatedHomeAppreciationRate) || 0,
          purchaseDate,
        },
      };
      saveProperty(updatedProperty);
    }
  }, [
    blocks,
    selectedYears,
    cashStrategy,
    idealCashHoldingBalance,
    estimatedHomeAppreciationRate,
    purchaseDate,
    property,
  ]);

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

        console.log({
          debug: "API_SYNC",
          blocks: blocks.map((b) => ({
            id: b.id,
            type: b.type,
            data: b.data,
          })),
          graphData: {
            length: result.graphData?.length || 0,
            data: result.graphData || [],
            sample: result.graphData?.slice(0, 3) || [],
          },
          monthlyPayment: result.monthlyPayment,
          loanOverlapMonthsMap: result.loanOverlapMonthsMap,
          debugBlocksSetup: result.debug?.blocks || null,
          fullResponse: result,
        });

        if (result.debug) {
          if (result.debug.blocks && result.debug.blocks.length > 0) {
            const hasCalculatedRefinance = result.debug.blocks.some(
              (b: Block) =>
                b.type === "refinance" &&
                (b.data as RefinanceBlockData)?.cost &&
                parseFloat((b.data as RefinanceBlockData).cost) > 0,
            );
            if (hasCalculatedRefinance) {
              setBlocks((prevBlocks) => {
                let changed = false;
                const updatedBlocks = prevBlocks.map((prevBlock) => {
                  const calculatedBlock = result.debug.blocks.find(
                    (cb: Block) => cb.type === prevBlock.type,
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
          console.log({
            debug: "METRICS_CALCULATION",
            metrics: result.metrics,
            roi: result.metrics.roi,
            annualizedRoi: result.metrics.annualizedRoi,
            cashOnCashReturn: result.metrics.cashOnCashReturn,
            capRate: result.metrics.capRate,
            netOperatingIncome: result.metrics.netOperatingIncome,
            netPresentValue: result.metrics.netPresentValue,
            totalProfit: result.metrics.totalProfit,
            timeToPayOffLoan: result.metrics.timeToPayOffLoan,
          });
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-text-muted">Loading property...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-6">
        <div className="text-text-muted">Property not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push("/")}
            className="text-primary hover:text-primary-dark mb-2 flex items-center gap-1 text-sm font-medium"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-text mb-2">{property.name}</h1>
          <p className="text-text-muted">{property.address}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-border p-3">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
              Project Settings
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-text-muted whitespace-nowrap">
                  Cash Balance
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    value={idealCashHoldingBalance}
                    onChange={(e) => setIdealCashHoldingBalance(e.target.value)}
                    className="w-32 pl-7 pr-3 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="10000"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-text-muted whitespace-nowrap">
                  Appreciation
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={estimatedHomeAppreciationRate}
                    onChange={(e) =>
                      setEstimatedHomeAppreciationRate(e.target.value)
                    }
                    className="w-20 pl-3 pr-8 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="3"
                    step="0.1"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                    %
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-text-muted whitespace-nowrap">
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-36 pl-3 pr-3 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="cashStrategy"
                    value="profit"
                    checked={cashStrategy === "profit"}
                    onChange={(e) =>
                      setCashStrategy(e.target.value as "profit" | "paydown")
                    }
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-xs text-text">Profit</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="cashStrategy"
                    value="paydown"
                    checked={cashStrategy === "paydown"}
                    onChange={(e) =>
                      setCashStrategy(e.target.value as "profit" | "paydown")
                    }
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-xs text-text">Paydown</span>
                </label>
              </div>
            </div>
          </div>
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
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
                ROI
              </p>
              <p className="text-2xl font-bold text-text">
                {displayMetrics.roi.toFixed(2)}%
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
                Annualized ROI
              </p>
              <p className="text-2xl font-bold text-text">
                {displayMetrics.annualizedRoi.toFixed(2)}%
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
                Cash on Cash Return
              </p>
              <p className="text-2xl font-bold text-text">
                {displayMetrics.cashOnCashReturn.toFixed(2)}%
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
                Cap Rate
              </p>
              <p className="text-2xl font-bold text-text">
                {displayMetrics.capRate.toFixed(2)}%
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
                NOI
              </p>
              <p className="text-2xl font-bold text-text">
                $
                {displayMetrics.netOperatingIncome.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
                Net Present Value
              </p>
              <p className="text-2xl font-bold text-text">
                $
                {displayMetrics.netPresentValue.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
                Time to Pay Off
              </p>
              <p className="text-2xl font-bold text-text">
                {metrics.timeToPayOffLoan !== null
                  ? `${Math.floor(metrics.timeToPayOffLoan / 12)}y ${metrics.timeToPayOffLoan % 12}m`
                  : "--"}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
                Total Profit
              </p>
              <p className="text-2xl font-bold text-text">
                $
                {displayMetrics.totalProfit.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
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
