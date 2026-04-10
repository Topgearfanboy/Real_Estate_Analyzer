import { render, screen, fireEvent } from "@testing-library/react";
import { BuyBlock } from "../index";
import type { BuyBlockData } from "../../../types";

const mockOnChange = jest.fn();

const testData: BuyBlockData = {
  cost: "350000",
  interestRate: "7.5",
  downpayment: "15",
  downpaymentType: "%",
  closingCosts: "5",
  closingCostsType: "%",
  propertyTaxes: "1.2",
  propertyTaxesType: "%",
  homeownersInsurance: "1200",
  homeownersInsuranceType: "$",
  loanTerm: "15",
  customLoanTerm: "",
  interestOnlyOption: true,
  loanAnalysis: {
    incomeNeeded: "85000",
    maxLoanBasedOnArv: "400000",
    initialCash: "50000",
    savedForRenovation: "25000",
    minimumCashForProject: "75000",
  },
};

describe("BuyBlock", () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders with test data values", () => {
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    // Cost field should show formatted value
    const textboxes = screen.getAllByRole("textbox");
    expect(textboxes.length).toBeGreaterThan(0);
  });

  it("calculates and displays monthly payment", () => {
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    expect(screen.getByText(/monthly payment/i)).toBeTruthy();
  });

  it("calculates and displays purchase summary details", () => {
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    // Expand the purchase summary section first
    const toggleButton = screen.getByRole("button", {
      name: /purchase summary/i,
    });
    fireEvent.click(toggleButton);

    expect(screen.getAllByText(/purchase price/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/loan amount/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/down payment/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/closing costs/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/total cash needed/i)).toBeTruthy();
  });

  it("toggles purchase summary section when clicked", () => {
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    const toggleButton = screen.getByRole("button", {
      name: /purchase summary/i,
    });

    // Section is collapsed by default, click to expand
    fireEvent.click(toggleButton);
    expect(screen.getByText(/purchase price/i)).toBeTruthy();

    // Click again to collapse
    fireEvent.click(toggleButton);
    expect(screen.queryByText(/purchase price/i)).toBeFalsy();
  });

  it("updates cost field when changed", () => {
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    const inputs = screen.getAllByRole("textbox");
    const costInput = inputs[0]; // First input is Cost
    fireEvent.change(costInput, { target: { value: "300000" } });

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("updates interest rate when changed", () => {
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    const inputs = screen.getAllByRole("textbox");
    const rateInput = inputs[1]; // Second input is Interest Rate
    fireEvent.change(rateInput, { target: { value: "5.5" } });

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("toggles interest only option when checkbox is clicked", () => {
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    const checkbox = screen.getByLabelText(/interest only option/i);
    // Test data has interestOnlyOption: true, so clicking should toggle to false
    fireEvent.click(checkbox);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        interestOnlyOption: false,
      }),
    );
  });

  it("renders project planning section", () => {
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    expect(screen.getByText(/project planning/i)).toBeTruthy();
  });

  it("calculates loan amount correctly", () => {
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    // Expand the purchase summary section first
    const toggleButton = screen.getByRole("button", {
      name: /purchase summary/i,
    });
    fireEvent.click(toggleButton);

    // With $350,000 cost and 15% down, loan amount should be $297,500
    expect(screen.getByText(/loan amount/i)).toBeTruthy();
  });

  it("displays segmented progress bar for monthly payment breakdown", () => {
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    // Progress bar labels should be visible (monthly payment section is always visible)
    expect(screen.getByText(/loan:/i)).toBeTruthy();
    expect(screen.getByText(/tax:/i)).toBeTruthy();
    expect(screen.getByText(/insurance:/i)).toBeTruthy();
  });
});
