import type { RefinanceBlockData } from "../../../types";
import {
  updateField,
  parseCurrencyValue,
  calculateLoanAmount,
  formatCurrencyDisplay,
  formatPercentageDisplay,
} from "../helpers";

const mockOnChange = jest.fn();

const createMockData = (
  overrides: Partial<RefinanceBlockData> = {}
): RefinanceBlockData => ({
  cashOut: false,
  estimatedValue: "400000",
  remainingEquityAmount: "80000",
  remainingEquityPercent: "20",
  ...overrides,
});

describe("RefinanceBlock Helpers", () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe("updateField", () => {
    it("updates a single field correctly", () => {
      const data = createMockData();
      updateField(data, mockOnChange, "estimatedValue", "500000");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        estimatedValue: "500000",
      });
    });

    it("updates boolean field correctly", () => {
      const data = createMockData({ cashOut: false });
      updateField(data, mockOnChange, "cashOut", true);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        cashOut: true,
      });
    });
  });

  describe("parseCurrencyValue", () => {
    it("parses formatted currency strings", () => {
      expect(parseCurrencyValue("$400,000")).toBe(400000);
    });

    it("parses plain numbers", () => {
      expect(parseCurrencyValue("400000")).toBe(400000);
    });

    it("returns 0 for empty strings", () => {
      expect(parseCurrencyValue("")).toBe(0);
    });

    it("handles decimal values", () => {
      expect(parseCurrencyValue("$400,000.50")).toBe(400000.5);
    });
  });

  describe("calculateLoanAmount", () => {
    it("calculates loan amount correctly", () => {
      expect(
        calculateLoanAmount("$400,000", "$80,000")
      ).toBe(320000);
    });

    it("handles zero values", () => {
      expect(calculateLoanAmount("", "")).toBe(0);
    });
  });

  describe("formatCurrencyDisplay", () => {
    it("formats positive numbers with dollar sign", () => {
      expect(formatCurrencyDisplay(320000)).toBe("$320,000");
    });

    it("returns dash for zero", () => {
      expect(formatCurrencyDisplay(0)).toBe("-");
    });
  });

  describe("formatPercentageDisplay", () => {
    it("formats percentage string with % sign", () => {
      expect(formatPercentageDisplay("20")).toBe("20.00%");
    });

    it("returns dash for zero", () => {
      expect(formatPercentageDisplay("")).toBe("-");
    });

    it("handles decimal percentages", () => {
      expect(formatPercentageDisplay("20.5")).toBe("20.50%");
    });
  });
});
