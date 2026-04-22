"use client";

import { useState, useEffect } from "react";
import type {
  Block,
  BlockType,
  BuyBlockData,
  RenovateBlockData,
  RefinanceBlockData,
  RentBlockData,
  SellBlockData,
} from "@/types";
import { BuyBlock } from "@/components/BuyBlock";
import { RenovateBlock } from "@/components/RenovateBlock";
import { RefinanceBlock } from "@/components/RefinanceBlock";
import { RentBlock } from "@/components/RentBlock";
import { SellBlock } from "@/components/SellBlock";
import { createBlock } from "@/defaultData";
import { blockTypeLabels, blockTypeColors, getBlockDotColor } from "./helpers";
import { LineGraph } from "@/components/uiComponents/LineGraph";

interface GraphDataPoint {
  date: string;
  investedCapital: number;
  cashOnHand: number;
  equity: number;
  remainingLoanBalance: number;
}

export default function Build() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);

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

  // Sync blocks to API on every change
  useEffect(() => {
    const syncBlocks = async () => {
      try {
        const response = await fetch("/api/build/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blocksJson: JSON.stringify(blocks) }),
        });
        const result = await response.json();
        if (result.graphData) {
          setGraphData(result.graphData);
        }
      } catch (error) {
        console.error("Failed to sync blocks:", error);
      }
    };

    if (blocks.length > 0) {
      void syncBlocks();
    }
  }, [blocks]);

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
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors flex items-center gap-2 shadow-md"
            title="Add block"
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
      <LineGraph data={graphData} />
    </div>
  );
}
