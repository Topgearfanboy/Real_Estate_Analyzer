import { TimelineEntry } from "./timeline";

// Calculate overlap in months between renovation and loan periods
export function getLoanOverlapMonths(
  renovateIndex: number,
  timeline: TimelineEntry[],
  loanStartIndex: number,
  loanEndDate: Date | null,
): number {
  if (loanStartIndex < 0 || !loanEndDate) return 0;

  const renovateBlock = timeline[renovateIndex];
  if (!renovateBlock) return 0;

  const renovateStart = renovateBlock.startDate;
  const renovateEnd = renovateBlock.endDate;
  const loanStart = timeline[loanStartIndex].startDate;

  // Calculate overlap
  const overlapStart = new Date(
    Math.max(renovateStart.getTime(), loanStart.getTime()),
  );
  const overlapEnd = new Date(
    Math.min(renovateEnd.getTime(), loanEndDate.getTime()),
  );

  // If no overlap, return 0
  if (overlapEnd <= overlapStart) return 0;

  // Calculate overlap in months
  const overlapMonths = Math.round(
    (overlapEnd.getTime() - overlapStart.getTime()) /
      (1000 * 60 * 60 * 24 * 30),
  );
  const result = Math.max(0, overlapMonths);

  return result;
}
