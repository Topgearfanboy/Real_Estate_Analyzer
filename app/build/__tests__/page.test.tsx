import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Build from "../page";

// Mock the fetch API
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe("Build Page Integration Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sets up blocks via UI and verifies refinance financed amount is not $0", async () => {
    const user = userEvent.setup();

    // Mock API responses to simulate backend calculation
    let callCount = 0;
    (global.fetch as jest.Mock).mockImplementation(async () => {
      callCount++;
      // After the refinance block is added (after 2nd call), return calculated blocks
      if (callCount > 2) {
        return {
          json: async () => ({
            debug: {
              blocks: [
                {
                  id: "buy-1",
                  type: "buy",
                  data: {
                    cost: "225000",
                    interestRate: "6",
                    downpayment: "20",
                    downpaymentType: "%",
                    closingCosts: "3",
                    closingCostsType: "%",
                    propertyTaxes: "1",
                    propertyTaxesType: "%",
                    annualHoa: "0",
                    homeownersInsurance: "740",
                    homeownersInsuranceType: "$",
                    loanTerm: "30",
                    customLoanTerm: "",
                    loanTermYears: 30,
                    interestOnlyOption: false,
                    loanAnalysis: {
                      monthlyPayment: "0",
                      totalInterest: "0",
                      incomeNeeded: "0",
                    },
                  },
                },
                {
                  id: "rent-1",
                  type: "rent",
                  data: {
                    monthlyRent: "2500",
                    timeRentedMonths: "0",
                    timeRentedYears: "1",
                    vacancy: "5",
                    vacancyType: "%",
                    management: "8",
                    managementType: "%",
                    maintenance: "100",
                    maintenanceType: "$",
                    annualRentIncrease: "0",
                    annualRentIncreaseType: "%",
                  },
                },
                {
                  id: "refinance-1",
                  type: "refinance",
                  data: {
                    cashOut: false,
                    estimatedValue: "300000",
                    remainingEquityAmount: "",
                    remainingEquityPercent: "",
                    cost: "177790.00", // Backend-calculated remaining balance
                    costType: "$",
                    interestRate: "",
                    closingCosts: "",
                    closingCostsType: "%",
                    propertyTaxes: "",
                    propertyTaxesType: "%",
                    homeownersInsurance: "",
                    homeownersInsuranceType: "$",
                    loanTerm: "30",
                    customLoanTerm: "",
                    loanTermYears: 30,
                    annualHoa: "0",
                    interestOnlyOption: false,
                  },
                },
              ],
              calculatedRefinancePercentage: "59.26",
            },
            graphData: [],
            monthlyPayment: 0,
            loanOverlapMonthsMap: {},
          }),
        };
      }

      // Before blocks are set up, return empty blocks
      return {
        json: async () => ({
          debug: {
            blocks: [],
            calculatedRefinancePercentage: null,
          },
          graphData: [],
          monthlyPayment: 0,
          loanOverlapMonthsMap: {},
        }),
      };
    });

    render(<Build />);

    // Add Buy block
    const addButton = screen.getByTestId("add-block-button");
    await user.click(addButton);
    await user.click(screen.getByTestId("add-buy-block"));

    // Fill in Buy block data
    await waitFor(() => {
      expect(screen.getByTestId("buy-cost")).toBeInTheDocument();
    });

    const buyCostInput = screen.getByTestId("buy-cost").querySelector("input");
    if (buyCostInput) {
      await user.clear(buyCostInput);
      await user.type(buyCostInput, "225000");
    }

    const buyInterestRateInput = screen
      .getByTestId("buy-interest-rate")
      .querySelector("input");
    if (buyInterestRateInput) {
      await user.clear(buyInterestRateInput);
      await user.type(buyInterestRateInput, "6");
    }

    // Add Rent block
    await user.click(addButton);
    await user.click(screen.getByTestId("add-rent-block"));

    // Fill in Rent block data
    await waitFor(() => {
      expect(screen.getByTestId("rent-monthly-rent")).toBeInTheDocument();
    });

    const rentMonthlyRentInput = screen
      .getByTestId("rent-monthly-rent")
      .querySelector("input");
    if (rentMonthlyRentInput) {
      await user.clear(rentMonthlyRentInput);
      await user.type(rentMonthlyRentInput, "2500");
    }

    // Add Refinance block
    await user.click(addButton);
    await user.click(screen.getByTestId("add-refinance-block"));

    // Fill in Refinance block data
    await waitFor(() => {
      expect(
        screen.getByTestId("refinance-estimated-value"),
      ).toBeInTheDocument();
    });

    const refinanceEstimatedValueInput = screen
      .getByTestId("refinance-estimated-value")
      .querySelector("input");
    if (refinanceEstimatedValueInput) {
      await user.clear(refinanceEstimatedValueInput);
      await user.type(refinanceEstimatedValueInput, "300000");
    }

    // Select Non Cash-out
    const nonCashOutRadio = screen.getByLabelText("Non Cash-out");
    await user.click(nonCashOutRadio);

    // Verify the refinance block is rendered with the financed amount field
    await waitFor(() => {
      const financedAmountElements = screen.queryAllByTestId(
        "refinance-financed-amount",
      );
      expect(financedAmountElements.length).toBeGreaterThan(0);
    });

    // The financed amount should display the calculated value (177790.00) not $0
    // The frontend now syncs blocks state with backend-calculated cost
    const financedAmountElements = screen.getAllByTestId(
      "refinance-financed-amount",
    );
    const inputElement = financedAmountElements.find(
      (el) => el.tagName === "INPUT",
    );
    expect(inputElement).not.toBeUndefined();
    const inputValue = (inputElement as HTMLInputElement)?.value || "";
    expect(inputValue).not.toBe("$0");
    expect(inputValue).toMatch(/177,790/);
  });
});
