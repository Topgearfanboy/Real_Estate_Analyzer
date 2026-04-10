"use client";

import { useState } from "react";
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

const blockTypeLabels: Record<BlockType, string> = {
  buy: "Buy",
  renovate: "Renovate",
  refinance: "Refinance",
  rent: "Rent",
  sell: "Sell",
};

const blockTypeColors: Record<BlockType, string> = {
  buy: "border-l-blue-500",
  renovate: "border-l-green-500",
  refinance: "border-l-purple-500",
  rent: "border-l-orange-500",
  sell: "border-l-teal-500",
};

export default function Home() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
      // Other blocks go at the end (before sell if exists)
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

  return (
    <>
      <nav className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-xl font-bold text-text">
              Real Estate Analyzer
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-text-muted hover:text-text transition-colors">
              Dashboard
            </button>
            <button className="text-text-muted hover:text-text transition-colors">
              Properties
            </button>
            <button className="text-text-muted hover:text-text transition-colors">
              Reports
            </button>
            <div className="w-px h-5 bg-border"></div>
            <button className="p-2 text-text-muted hover:text-text hover:bg-gray-100 rounded-lg transition-colors">
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

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
                    className={`w-3 h-3 rounded-full ${
                      block.type === "buy"
                        ? "bg-blue-500"
                        : block.type === "renovate"
                          ? "bg-green-500"
                          : block.type === "refinance"
                            ? "bg-purple-500"
                            : block.type === "rent"
                              ? "bg-orange-500"
                              : "bg-teal-500"
                    }`}
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
      </div>
    </>
  );
}
