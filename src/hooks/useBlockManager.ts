import { useState } from "react";
import type { Block, BlockType } from "@/types";
import { createBlock } from "@/defaultData";

interface UseBlockManagerReturn {
  blocks: Block[];
  setBlocks: (blocks: Block[] | ((prev: Block[]) => Block[])) => void;
  addBlock: (type: BlockType) => void;
  removeBlock: (id: string) => void;
  moveBlock: (index: number, direction: "up" | "down") => void;
  updateBlockData: (id: string, data: Block["data"]) => void;
  hasBuyBlock: boolean;
  hasSellBlock: boolean;
  sellBlockIndex: number;
}

export function useBlockManager(
  initialBlocks: Block[] = [],
): UseBlockManagerReturn {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);

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

  return {
    blocks,
    setBlocks,
    addBlock,
    removeBlock,
    moveBlock,
    updateBlockData,
    hasBuyBlock,
    hasSellBlock,
    sellBlockIndex,
  };
}
