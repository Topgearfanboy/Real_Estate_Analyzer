import { Block, RenovateBlockData, RentBlockData } from "@/types";

export interface TimelineEntry {
  type: string;
  startDate: Date;
  endDate: Date;
}

// Calculate a block's duration in fractional months (no rounding).
// Days are converted using a 30-day month so partial months are preserved,
// which allows downstream proration of income/costs across month boundaries.
export function blockDurationMonths(block: Block): number {
  if (block.type === "renovate") {
    const renovateData = block.data as RenovateBlockData;
    const days = parseInt(renovateData.timeToRenovate.days) || 0;
    const months = parseInt(renovateData.timeToRenovate.months) || 0;
    const years = parseInt(renovateData.timeToRenovate.years) || 0;
    return days / 30 + months + years * 12;
  }
  if (block.type === "rent") {
    const rentData = block.data as RentBlockData;
    const months = parseInt(rentData.timeRentedMonths) || 0;
    const years = parseInt(rentData.timeRentedYears) || 0;
    return months + years * 12;
  }
  // Buy, refinance, and sell are instant blocks
  return 0;
}

// Fraction (0..1) of the calendar month at integer index `monthIndex`
// (covering the fractional-month interval [monthIndex, monthIndex + 1)) that
// overlaps an active window starting at `start` with the given `duration`.
export function monthOverlap(
  monthIndex: number,
  start: number,
  duration: number,
): number {
  const end = start + duration;
  return Math.max(
    0,
    Math.min(monthIndex + 1, end) - Math.max(monthIndex, start),
  );
}

// Calculate timeline for all blocks to determine loan active status
export function calculateTimeline(
  blocks: Block[],
  purchaseDate: string = new Date().toISOString().split("T")[0],
): TimelineEntry[] {
  const timeline: TimelineEntry[] = [];
  let currentDate = new Date(purchaseDate); // Start from purchase date

  blocks.forEach((block) => {
    let durationMonths = 0;

    if (block.type === "renovate") {
      const renovateData = block.data as RenovateBlockData;
      const days = parseInt(renovateData.timeToRenovate.days) || 0;
      const months = parseInt(renovateData.timeToRenovate.months) || 0;
      const years = parseInt(renovateData.timeToRenovate.years) || 0;
      durationMonths = Math.round(days / 30) + months + years * 12;
    } else if (block.type === "rent") {
      const rentData = block.data as RentBlockData;
      const months = parseInt(rentData.timeRentedMonths) || 0;
      const years = parseInt(rentData.timeRentedYears) || 0;
      durationMonths = months + years * 12;
    }
    // Buy, refinance, and sell are instant blocks (durationMonths = 0)

    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    timeline.push({ type: block.type, startDate, endDate });

    // Move to next block start date
    currentDate = new Date(endDate);
  });

  return timeline;
}
