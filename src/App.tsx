import { useState } from "react";
import type {
  Block,
  BlockType,
  BuyBlockData,
  RenovateBlockData,
  RefinanceBlockData,
} from "./types";
import { BuyBlock } from "./components/BuyBlock";
import { RenovateBlock } from "./components/RenovateBlock";
import { RefinanceBlock } from "./components/RefinanceBlock";
import { createBlock } from "./defaultData";
import "./App.css";

const blockTypeLabels: Record<BlockType, string> = {
  buy: "Buy",
  renovate: "Renovate",
  refinance: "Refinance",
};

const blockTypeColors: Record<BlockType, string> = {
  buy: "border-l-blue-500",
  renovate: "border-l-green-500",
  refinance: "border-l-purple-500",
};

function App() {
  const [blocks, setBlocks] = useState<Block[]>([]);

  const addBlock = (type: BlockType) => {
    setBlocks([...blocks, createBlock(type)]);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index > 0) {
      const newBlocks = [...blocks];
      [newBlocks[index - 1], newBlocks[index]] = [
        newBlocks[index],
        newBlocks[index - 1],
      ];
      setBlocks(newBlocks);
    } else if (direction === "down" && index < blocks.length - 1) {
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
    <div className="min-h-screen bg-bg">
      <div className="p-6">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">
              Real Estate Analyzer
            </h1>
            <p className="text-text-muted">
              Create, organize, and manage your property investment blocks
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => addBlock("buy")}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
            >
              + Buy Block
            </button>
            <button
              onClick={() => addBlock("renovate")}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors"
            >
              + Renovate Block
            </button>
            <button
              onClick={() => addBlock("refinance")}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium transition-colors"
            >
              + Refinance Block
            </button>
          </div>
        </header>

        <div className="flex flex-row gap-4 overflow-x-auto pb-4 items-start">
          {blocks.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-border min-w-[300px] flex-shrink-0">
              <p className="text-text-muted text-lg">
                No blocks yet. Click a button above to add your first block.
              </p>
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
                          : "bg-purple-500"
                    }`}
                  />
                  {blockTypeLabels[block.type]} Block #{index + 1}
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveBlock(index, "up")}
                    disabled={index === 0}
                    className="p-2 text-text-muted hover:text-text hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move left"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => moveBlock(index, "down")}
                    disabled={index === blocks.length - 1}
                    className="p-2 text-text-muted hover:text-text hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move right"
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
