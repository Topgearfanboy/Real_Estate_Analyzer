import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { RefinanceBlock } from "../index";
import type { RefinanceBlockData } from "../../../types";

const mockOnChange = jest.fn();

const createMockData = (
  overrides: Partial<RefinanceBlockData> = {},
): RefinanceBlockData => ({
  cashOut: false,
  estimatedValue: "400000",
  remainingEquityAmount: "80000",
  remainingEquityPercent: "20",
  cost: "320000",
  costType: "$",
  interestRate: "6.5",
  closingCosts: "3",
  closingCostsType: "%",
  propertyTaxes: "4000",
  propertyTaxesType: "$",
  homeownersInsurance: "1200",
  homeownersInsuranceType: "$",
  loanTerm: "30",
  customLoanTerm: "",
  interestOnlyOption: false,
  loanTermYears: 30,
  loanStartDate: "",
  monthlyPayment: undefined,
  annualHoa: "0",
  ...overrides,
});

describe("RefinanceBlock", () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe("Rendering", () => {
    it("renders the component without crashing", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Refinance Type")).toBeInTheDocument();
    });

    it("renders refinance type radio buttons", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Non Cash-out")).toBeInTheDocument();
      expect(screen.getByText("Cash Out")).toBeInTheDocument();
    });

    it("renders estimated value field", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Estimated Value")).toBeInTheDocument();
    });

    it("renders interest rate field", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Interest Rate")).toBeInTheDocument();
    });

    it("renders financed amount field", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Financed Amount")).toBeInTheDocument();
    });

    it("renders closing costs field", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Closing Costs")).toBeInTheDocument();
    });

    it("renders loan term button group", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Loan Term")).toBeInTheDocument();
    });

    it("renders property taxes field", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Property Taxes (Annual)")).toBeInTheDocument();
    });

    it("renders insurance field", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Insurance (Annual)")).toBeInTheDocument();
    });

    it("renders interest only checkbox", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Interest Only Loan")).toBeInTheDocument();
    });

    it("renders refinance summary section", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Refinance Summary")).toBeInTheDocument();
    });

    it("renders remaining equity section", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Remaining Equity")).toBeInTheDocument();
    });
  });

  describe("Refinance Type Selection", () => {
    it("selects non cash-out by default", () => {
      const data = createMockData({ cashOut: false });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      const radioButtons = screen.getAllByRole("radio");
      expect(radioButtons[0]).toBeChecked();
      expect(radioButtons[1]).not.toBeChecked();
    });

    it("calls onChange when cash-out is selected", () => {
      const data = createMockData({ cashOut: false });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      const radioButtons = screen.getAllByRole("radio");
      fireEvent.click(radioButtons[1]); // Click Cash Out

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ cashOut: true }),
      );
    });

    it("calls onChange when non cash-out is selected", () => {
      const data = createMockData({ cashOut: true });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      const radioButtons = screen.getAllByRole("radio");
      fireEvent.click(radioButtons[0]); // Click Non Cash-out

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ cashOut: false }),
      );
    });
  });

  describe("Interest Only Option", () => {
    it("toggles interest only checkbox", () => {
      const data = createMockData({ interestOnlyOption: false });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ interestOnlyOption: true }),
      );
    });
  });

  describe("Custom Loan Term", () => {
    it("shows custom input when custom loan term is selected", () => {
      const data = createMockData({ loanTerm: "custom" });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      expect(screen.getByPlaceholderText("Enter years")).toBeInTheDocument();
    });

    it("does not show custom input when standard loan term is selected", () => {
      const data = createMockData({ loanTerm: "30" });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      expect(
        screen.queryByPlaceholderText("Enter years"),
      ).not.toBeInTheDocument();
    });

    it("accepts numeric input for custom loan term", () => {
      const data = createMockData({ loanTerm: "custom", customLoanTerm: "" });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText("Enter years");
      fireEvent.change(input, { target: { value: "25" } });

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ customLoanTerm: "25" }),
      );
    });

    it("filters non-numeric characters from custom loan term", () => {
      const data = createMockData({ loanTerm: "custom", customLoanTerm: "" });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText("Enter years");
      fireEvent.change(input, { target: { value: "25abc" } });

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ customLoanTerm: "25" }),
      );
    });
  });

  describe("Refinance Summary", () => {
    it("displays monthly payment", () => {
      const data = createMockData({
        cost: "320000",
        interestRate: "6.5",
        loanTerm: "30",
        propertyTaxes: "4000",
        propertyTaxesType: "$",
        homeownersInsurance: "1200",
        homeownersInsuranceType: "$",
      });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      expect(screen.getByText("Monthly Payment")).toBeInTheDocument();
    });

    it("toggles refinance summary details on click", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      const toggleButton = screen
        .getByText("Refinance Summary")
        .closest("button");
      fireEvent.click(toggleButton!);

      // After clicking, the details should be visible
      expect(screen.getByText("Purchase Price")).toBeInTheDocument();
    });
  });

  describe("Remaining Equity Section", () => {
    it("renders remaining equity section title", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      expect(screen.getByText("Remaining Equity")).toBeInTheDocument();
    });

    it("shows remaining equity fields when expanded", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      // Click to expand the section
      const toggleButton = screen
        .getByText("Remaining Equity")
        .closest("button");
      fireEvent.click(toggleButton!);

      expect(screen.getByText("Amount ($)")).toBeInTheDocument();
      expect(screen.getByText("Percentage (%)")).toBeInTheDocument();
    });
  });

  describe("Monthly Payment Calculation", () => {
    it("calculates monthly payment correctly with 0% interest rate", () => {
      const data = createMockData({
        estimatedValue: "300000",
        cost: "240000",
        costType: "$",
        interestRate: "0",
        loanTerm: "30",
        closingCosts: "0",
        closingCostsType: "%",
        propertyTaxes: "0",
        propertyTaxesType: "%",
        homeownersInsurance: "0",
        homeownersInsuranceType: "$",
      });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      // With 0% interest, $240,000 loan over 30 years = $240,000 / 360 = $666.67
      const monthlyPaymentElement =
        screen.getByText("Monthly Payment").nextElementSibling;
      expect(monthlyPaymentElement?.textContent).toContain("$666.67");
    });

    it("calculates monthly payment correctly with percentage financed amount", () => {
      const data = createMockData({
        estimatedValue: "300000",
        cost: "80",
        costType: "%",
        interestRate: "0",
        loanTerm: "30",
        closingCosts: "0",
        closingCostsType: "%",
        propertyTaxes: "0",
        propertyTaxesType: "%",
        homeownersInsurance: "0",
        homeownersInsuranceType: "$",
      });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      // 80% of $300,000 = $240,000 loan
      // With 0% interest over 30 years = $240,000 / 360 = $666.67
      const monthlyPaymentElement =
        screen.getByText("Monthly Payment").nextElementSibling;
      expect(monthlyPaymentElement?.textContent).toContain("$666.67");
    });

    it("produces same monthly payment for equivalent % and $ financed amounts", () => {
      // Test with dollar amount
      const dataDollar = createMockData({
        estimatedValue: "300000",
        cost: "240000",
        costType: "$",
        interestRate: "6.5",
        loanTerm: "30",
        closingCosts: "0",
        closingCostsType: "%",
        propertyTaxes: "0",
        propertyTaxesType: "%",
        homeownersInsurance: "0",
        homeownersInsuranceType: "$",
      });
      const { rerender } = render(
        <RefinanceBlock data={dataDollar} onChange={mockOnChange} />,
      );
      const monthlyPaymentDollar =
        screen.getByText("Monthly Payment").nextElementSibling?.textContent;

      // Test with equivalent percentage
      const dataPercent = createMockData({
        estimatedValue: "300000",
        cost: "80",
        costType: "%",
        interestRate: "6.5",
        loanTerm: "30",
        closingCosts: "0",
        closingCostsType: "%",
        propertyTaxes: "0",
        propertyTaxesType: "%",
        homeownersInsurance: "0",
        homeownersInsuranceType: "$",
      });
      rerender(<RefinanceBlock data={dataPercent} onChange={mockOnChange} />);
      const monthlyPaymentPercent =
        screen.getByText("Monthly Payment").nextElementSibling?.textContent;

      expect(monthlyPaymentDollar).toBe(monthlyPaymentPercent);
    });

    it("includes property taxes in monthly payment when set as dollar amount", () => {
      const data = createMockData({
        estimatedValue: "300000",
        cost: "240000",
        costType: "$",
        interestRate: "0",
        loanTerm: "30",
        closingCosts: "0",
        closingCostsType: "%",
        propertyTaxes: "3600",
        propertyTaxesType: "$",
        homeownersInsurance: "0",
        homeownersInsuranceType: "$",
      });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      // Loan: $666.67 + Taxes: $300 = $966.67
      const monthlyPaymentElement =
        screen.getByText("Monthly Payment").nextElementSibling;
      expect(monthlyPaymentElement?.textContent).toContain("$966.67");
    });

    it("includes property taxes in monthly payment when set as percentage", () => {
      const data = createMockData({
        estimatedValue: "300000",
        cost: "240000",
        costType: "$",
        interestRate: "0",
        loanTerm: "30",
        closingCosts: "0",
        closingCostsType: "%",
        propertyTaxes: "1.5",
        propertyTaxesType: "%",
        homeownersInsurance: "0",
        homeownersInsuranceType: "$",
      });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      // Loan: $666.67 + Taxes: ($240,000 * 0.015 / 12) = $300 = $966.67
      const monthlyPaymentElement =
        screen.getByText("Monthly Payment").nextElementSibling;
      expect(monthlyPaymentElement?.textContent).toContain("$966.67");
    });

    it("includes insurance in monthly payment", () => {
      const data = createMockData({
        estimatedValue: "300000",
        cost: "240000",
        costType: "$",
        interestRate: "0",
        loanTerm: "30",
        closingCosts: "0",
        closingCostsType: "%",
        propertyTaxes: "0",
        propertyTaxesType: "%",
        homeownersInsurance: "1200",
        homeownersInsuranceType: "$",
      });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      // Loan: $666.67 + Insurance: $100 = $766.67
      const monthlyPaymentElement =
        screen.getByText("Monthly Payment").nextElementSibling;
      expect(monthlyPaymentElement?.textContent).toContain("$766.67");
    });

    it("calculates interest-only payment correctly", () => {
      const data = createMockData({
        estimatedValue: "300000",
        cost: "240000",
        costType: "$",
        interestRate: "6",
        loanTerm: "30",
        closingCosts: "0",
        closingCostsType: "%",
        propertyTaxes: "0",
        propertyTaxesType: "%",
        homeownersInsurance: "0",
        homeownersInsuranceType: "$",
        interestOnlyOption: true,
      });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      // Interest only: $240,000 * 0.06 / 12 = $1,200
      const monthlyPaymentElement =
        screen.getByText("Monthly Payment").nextElementSibling;
      expect(monthlyPaymentElement?.textContent).toContain("$1,200");
    });
  });
});
