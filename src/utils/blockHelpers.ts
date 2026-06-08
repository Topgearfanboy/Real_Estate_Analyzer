import { BlockType } from "@/types";

export const blockTypeLabels: Record<BlockType, string> = {
  buy: "Buy",
  renovate: "Renovate",
  refinance: "Refinance",
  rent: "Rent",
  sell: "Sell",
};

export const blockTypeColors: Record<BlockType, string> = {
  buy: "border-l-blue-500",
  renovate: "border-l-green-500",
  refinance: "border-l-purple-500",
  rent: "border-l-orange-500",
  sell: "border-l-teal-500",
};

export function getBlockDotColor(type: BlockType): string {
  switch (type) {
    case "buy":
      return "bg-blue-500";
    case "renovate":
      return "bg-green-500";
    case "refinance":
      return "bg-purple-500";
    case "rent":
      return "bg-orange-500";
    case "sell":
      return "bg-teal-500";
    default:
      return "bg-gray-500";
  }
}
