import type { RenovateBlockData, RenovationItem } from "../../../types";
import {
  addItem,
  removeItem,
  updateItem,
  calculateTotalCost,
  calculateTotalDays,
  calculateAverageCostPerItem,
} from "../helpers";

const mockOnChange = jest.fn();

const createMockData = (
  overrides: Partial<RenovateBlockData> = {}
): RenovateBlockData => ({
  items: [],
  timeToRenovate: { days: "", months: "", years: "" },
  monthlyCostToOwn: {
    utilities: { county: "", electricity: "", networking: "" },
    deferredInterestPrincipalOption: "",
  },
  ...overrides,
});

describe("RenovateBlock Helpers", () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe("addItem", () => {
    it("adds a new empty item to the list", () => {
      const data = createMockData({ items: [] });
      addItem(data, mockOnChange);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        items: [{ item: "", cost: "" }],
      });
    });

    it("appends to existing items", () => {
      const existingItems: RenovationItem[] = [
        { item: "Kitchen", cost: "5000" },
      ];
      const data = createMockData({ items: existingItems });
      addItem(data, mockOnChange);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        items: [
          { item: "Kitchen", cost: "5000" },
          { item: "", cost: "" },
        ],
      });
    });
  });

  describe("removeItem", () => {
    it("removes item at specified index", () => {
      const items: RenovationItem[] = [
        { item: "Kitchen", cost: "5000" },
        { item: "Bathroom", cost: "3000" },
      ];
      const data = createMockData({ items });
      removeItem(data, mockOnChange, 0);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        items: [{ item: "Bathroom", cost: "3000" }],
      });
    });
  });

  describe("updateItem", () => {
    it("updates the specified field of an item", () => {
      const items: RenovationItem[] = [
        { item: "Kitchen", cost: "5000" },
      ];
      const data = createMockData({ items });
      updateItem(data, mockOnChange, 0, "cost", "6000");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        items: [{ item: "Kitchen", cost: "6000" }],
      });
    });
  });

  describe("calculateTotalCost", () => {
    it("calculates total from formatted currency strings", () => {
      const items: RenovationItem[] = [
        { item: "Kitchen", cost: "$5,000" },
        { item: "Bathroom", cost: "$3,000" },
      ];
      expect(calculateTotalCost(items)).toBe(8000);
    });

    it("handles empty costs gracefully", () => {
      const items: RenovationItem[] = [
        { item: "Kitchen", cost: "" },
        { item: "Bathroom", cost: "$3,000" },
      ];
      expect(calculateTotalCost(items)).toBe(3000);
    });
  });

  describe("calculateTotalDays", () => {
    it("calculates total days from days, months, and years", () => {
      const timeToRenovate = { days: "15", months: "2", years: "1" };
      expect(calculateTotalDays(timeToRenovate)).toBe(15 + 60 + 365);
    });

    it("handles empty values as zeros", () => {
      const timeToRenovate = { days: "", months: "", years: "" };
      expect(calculateTotalDays(timeToRenovate)).toBe(0);
    });
  });

  describe("calculateAverageCostPerItem", () => {
    it("calculates average when both values are valid", () => {
      expect(calculateAverageCostPerItem(10000, 2)).toBe("$5,000");
    });

    it("returns dash when item count is zero", () => {
      expect(calculateAverageCostPerItem(10000, 0)).toBe("-");
    });

    it("returns dash when total cost is zero", () => {
      expect(calculateAverageCostPerItem(0, 2)).toBe("-");
    });
  });
});
