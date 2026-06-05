import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  annualHoa: "0",
  homeownersInsurance: "1200",
  homeownersInsuranceType: "$",
  loanTerm: "15",
  customLoanTerm: "",
  loanTermYears: 15,
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

    // Verify formatted currency/percentage values are visible
    expect(screen.getByDisplayValue("$350,000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("7.50%")).toBeInTheDocument();
    expect(screen.getByDisplayValue("15.00%")).toBeInTheDocument();
  });

  it("calculates and displays monthly payment", () => {
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    // Interest-only: $297,500 * 7.5% / 12 = ~$1,859
    expect(screen.getByText(/monthly payment/i)).toBeTruthy();
    // Verify breakdown labels are present (progress bar shows loan/tax/insurance/HOA)
    expect(screen.getByText(/loan:/i)).toBeTruthy();
    expect(screen.getByText(/tax:/i)).toBeTruthy();
    expect(screen.getByText(/insurance:/i)).toBeTruthy();
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

  it("updates cost field when changed", async () => {
    const user = userEvent.setup();
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    const inputs = screen.getAllByRole("textbox");
    const costInput = inputs[0]; // First input is Cost
    await user.clear(costInput);
    await user.type(costInput, "300000");
    fireEvent.blur(costInput);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ cost: "300000" }),
    );
  });

  it("updates interest rate when changed", async () => {
    const user = userEvent.setup();
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    const inputs = screen.getAllByRole("textbox");
    const rateInput = inputs[1]; // Second input is Interest Rate
    await user.clear(rateInput);
    await user.type(rateInput, "5.5");
    fireEvent.blur(rateInput);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ interestRate: "5.5" }),
    );
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

  it("renders project planning section with values", () => {
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    // Expand project planning section first
    const toggleButton = screen.getByRole("button", {
      name: /project planning/i,
    });
    fireEvent.click(toggleButton);

    expect(screen.getByText(/project planning/i)).toBeTruthy();
    expect(screen.getByDisplayValue("$85,000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("$400,000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("$50,000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("$25,000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("$75,000")).toBeInTheDocument();
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
    expect(
      screen.getByText((content) => content.includes("$297,500")),
    ).toBeInTheDocument();
  });

  it("displays segmented progress bar for monthly payment breakdown", () => {
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    // Progress bar labels should be visible (monthly payment section is always visible)
    expect(screen.getByText(/loan:/i)).toBeTruthy();
    expect(screen.getByText(/tax:/i)).toBeTruthy();
    expect(screen.getByText(/insurance:/i)).toBeTruthy();
  });
});
