import { useState, useEffect, useCallback } from "react";
import type {
  Block,
  BlockType,
  ProjectSettings,
  BuyBlockData,
  RefinanceBlockData,
} from "@/types";
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
  projectSettings?: ProjectSettings,
): UseBlockManagerReturn {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);

  const hasBuyBlock = blocks.some((b) => b.type === "buy");
  const hasSellBlock = blocks.some((b) => b.type === "sell");
  const sellBlockIndex = blocks.findIndex((b) => b.type === "sell");

  const addBlock = (type: BlockType) => {
    if (type === "buy" && hasBuyBlock) return;
    if (type === "sell" && hasSellBlock) return;

    const newBlock = createBlock(type);

    // Calculate initial estimated value for refinance blocks
    if (type === "refinance" && projectSettings) {
      const buyBlock = blocks.find((b) => b.type === "buy");
      if (buyBlock) {
        const purchasePrice =
          parseFloat(
            (buyBlock.data as BuyBlockData).cost.replace(/[^0-9.]/g, ""),
          ) || 0;
        const appreciationRate =
          projectSettings.estimatedHomeAppreciationRate / 100;
        const purchaseDate = new Date(projectSettings.purchaseDate);
        const currentDate = new Date();

        // Calculate years since purchase
        const yearsSincePurchase =
          (currentDate.getTime() - purchaseDate.getTime()) /
          (1000 * 60 * 60 * 24 * 365);

        // Calculate appreciated value: purchasePrice * (1 + appreciationRate) ^ yearsSincePurchase
        const appreciatedValue =
          purchasePrice * Math.pow(1 + appreciationRate, yearsSincePurchase);

        // Update the refinance block with calculated estimated value
        (newBlock.data as RefinanceBlockData).estimatedValue =
          `$${Math.round(appreciatedValue).toLocaleString()}`;
      }
    }

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

  // Calculate appreciated value based on purchase price and appreciation
  const calculateAppreciatedValue = useCallback(
    (buyBlock: Block, appreciationRate: number, purchaseDate: string) => {
      const purchasePrice =
        parseFloat(
          (buyBlock.data as BuyBlockData).cost.replace(/[^0-9.]/g, ""),
        ) || 0;
      const startDate = new Date(purchaseDate);
      const currentDate = new Date();

      // Calculate years since purchase
      const yearsSincePurchase =
        (currentDate.getTime() - startDate.getTime()) /
        (1000 * 60 * 60 * 24 * 365);

      // Calculate appreciated value: purchasePrice * (1 + appreciationRate) ^ yearsSincePurchase
      return purchasePrice * Math.pow(1 + appreciationRate, yearsSincePurchase);
    },
    [],
  );

  // Update refinance block estimated values when project settings change
  useEffect(() => {
    if (!projectSettings) return;

    const buyBlock = blocks.find((b) => b.type === "buy");
    if (!buyBlock) return;

    const appreciationRate =
      projectSettings.estimatedHomeAppreciationRate / 100;
    const appreciatedValue = calculateAppreciatedValue(
      buyBlock,
      appreciationRate,
      projectSettings.purchaseDate,
    );

    // Check if any refinance blocks need updating
    const needsUpdate = blocks.some(
      (block) =>
        block.type === "refinance" &&
        !(block.data as RefinanceBlockData).estimatedValue,
    );

    if (needsUpdate) {
      // Use setTimeout to defer the state update and avoid cascading renders
      setTimeout(() => {
        setBlocks((prevBlocks) =>
          prevBlocks.map((block) => {
            if (
              block.type === "refinance" &&
              !(block.data as RefinanceBlockData).estimatedValue
            ) {
              return {
                ...block,
                data: {
                  ...block.data,
                  estimatedValue: `$${Math.round(appreciatedValue).toLocaleString()}`,
                },
              };
            }
            return block;
          }),
        );
      }, 0);
    }
  }, [blocks, projectSettings, calculateAppreciatedValue]);

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
