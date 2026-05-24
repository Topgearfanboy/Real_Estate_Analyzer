import { getLoanOverlapMonths } from "../loanOverlap";
import { TimelineEntry } from "../timeline";

describe("getLoanOverlapMonths", () => {
  const mockTimeline: TimelineEntry[] = [
    {
      type: "buy",
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 0, 1),
    },
    {
      type: "renovate",
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 6, 1), // 6 months
    },
  ];

  it("should return 0 when loan start index is invalid", () => {
    const result = getLoanOverlapMonths(1, mockTimeline, -1, null);
    expect(result).toBe(0);
  });

  it("should return 0 when loan end date is null", () => {
    const result = getLoanOverlapMonths(1, mockTimeline, 0, null);
    expect(result).toBe(0);
  });

  it("should return 0 when renovate block does not exist", () => {
    const result = getLoanOverlapMonths(99, mockTimeline, 0, new Date(2025, 0, 1));
    expect(result).toBe(0);
  });

  it("should calculate overlap when renovation is within loan period", () => {
    const loanEndDate = new Date(2024, 12, 1); // 1 year loan
    const result = getLoanOverlapMonths(1, mockTimeline, 0, loanEndDate);
    expect(result).toBe(6); // 6 months overlap
  });

  it("should return 0 when renovation ends before loan starts", () => {
    const timeline: TimelineEntry[] = [
      {
        type: "buy",
        startDate: new Date(2024, 6, 1),
        endDate: new Date(2024, 6, 1),
      },
      {
        type: "renovate",
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 3, 1),
      },
    ];
    const loanEndDate = new Date(2025, 0, 1);
    const result = getLoanOverlapMonths(1, timeline, 0, loanEndDate);
    expect(result).toBe(0);
  });

  it("should return 0 when renovation starts after loan ends", () => {
    const timeline: TimelineEntry[] = [
      {
        type: "buy",
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 1),
      },
      {
        type: "renovate",
        startDate: new Date(2025, 0, 1),
        endDate: new Date(2025, 6, 1),
      },
    ];
    const loanEndDate = new Date(2024, 6, 1);
    const result = getLoanOverlapMonths(1, timeline, 0, loanEndDate);
    expect(result).toBe(0);
  });

  it("should calculate partial overlap", () => {
    const timeline: TimelineEntry[] = [
      {
        type: "buy",
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 1),
      },
      {
        type: "renovate",
        startDate: new Date(2024, 3, 1),
        endDate: new Date(2024, 9, 1),
      },
    ];
    const loanEndDate = new Date(2024, 6, 1); // 6 month loan
    const result = getLoanOverlapMonths(1, timeline, 0, loanEndDate);
    expect(result).toBe(3); // 3 months overlap (March to June)
  });
});
