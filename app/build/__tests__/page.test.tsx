import {
  render,
  screen,
  waitFor,
  within,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Build from "../page";

// Mock the fetch API
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

function mockFetchResponses(
  options: {
    buildResponse?: Record<string, unknown>;
    metricsResponse?: Record<string, unknown>;
  } = {},
) {
  const defaultBuildResponse = {
    debug: { blocks: [], calculatedRefinancePercentage: null as string | null },
    graphData: [],
    monthlyPayment: 0,
    loanOverlapMonthsMap: {},
  };

  const defaultMetricsResponse = {
    metrics: {
      roi: 12.5,
      cashOnCashReturn: 8.3,
      timeToPayOffLoan: 120,
      totalProfit: 150000,
      netPresentValue: 100000,
      annualizedRoi: 10.2,
      capRate: 6.5,
      netOperatingIncome: 24000,
      totalRoi: 45.0,
    },
  };

  (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
    if (url === "/api/build") {
      return {
        json: async () => ({
          ...defaultBuildResponse,
          ...options.buildResponse,
        }),
      };
    }
    if (url === "/api/metrics") {
      return {
        json: async () => ({
          ...defaultMetricsResponse,
          ...options.metricsResponse,
        }),
      };
    }
    return { json: async () => ({}) };
  });
}

/** Find the closest input or select element relative to a label with the given text. */
function getInputForLabel(
  labelText: string,
): HTMLInputElement | HTMLSelectElement {
  const label = screen.getByText(labelText);
  const container = label.parentElement;
  if (!container) throw new Error(`No container for label: ${labelText}`);
  const input = container.querySelector("input, select");
  if (!input) throw new Error(`No input/select found for label: ${labelText}`);
  return input as HTMLInputElement | HTMLSelectElement;
}

/** Helper to type a raw numeric value into a CurrencyField or PercentageField by label. */
async function typeByLabel(
  user: ReturnType<typeof userEvent.setup>,
  labelText: string,
  value: string,
) {
  const input = getInputForLabel(labelText);
  await user.clear(input);
  await user.type(input, value);
  fireEvent.blur(input);
}

/** Helper to click a CollapsibleSection by its title text. */
async function expandSection(
  user: ReturnType<typeof userEvent.setup>,
  title: string,
) {
  const btn = screen.getByRole("button", { name: new RegExp(title, "i") });
  await user.click(btn);
}

describe("Build Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchResponses();
  });

  describe("Initial Render", () => {
    it("shows empty state when no blocks exist", () => {
      render(<Build />);
      expect(screen.getByText("No blocks yet")).toBeInTheDocument();
      expect(
        screen.getByText(/Start building your real estate analysis/),
      ).toBeInTheDocument();
      expect(screen.getByText("Property Manager")).toBeInTheDocument();
    });

    it("renders project settings with default values", () => {
      render(<Build />);
      const cashInput = screen.getByPlaceholderText("10000");
      expect(cashInput).toHaveValue(10000);
      const appreciationInput = screen.getByPlaceholderText("3");
      expect(appreciationInput).toHaveValue(3);
      expect(screen.getByLabelText("Profit")).toBeChecked();
      expect(screen.getByLabelText("Paydown")).not.toBeChecked();
    });
  });

  describe("Project Settings", () => {
    it("can update cash balance", async () => {
      const user = userEvent.setup();
      render(<Build />);
      const input = screen.getByPlaceholderText("10000");
      await user.clear(input);
      await user.type(input, "25000");
      expect(input).toHaveValue(25000);
    });

    it("can update appreciation rate", async () => {
      const user = userEvent.setup();
      render(<Build />);
      const input = screen.getByPlaceholderText("3");
      await user.clear(input);
      await user.type(input, "4.5");
      expect(input).toHaveValue(4.5);
    });

    it("can update purchase date", async () => {
      const user = userEvent.setup();
      render(<Build />);
      const today = new Date().toISOString().split("T")[0];
      const input = screen.getByDisplayValue(today);
      await user.clear(input);
      await user.type(input, "2024-06-15");
      expect(input).toHaveValue("2024-06-15");
    });

    it("can toggle cash strategy between profit and paydown", async () => {
      const user = userEvent.setup();
      render(<Build />);
      const paydown = screen.getByLabelText("Paydown");
      await user.click(paydown);
      expect(paydown).toBeChecked();
      expect(screen.getByLabelText("Profit")).not.toBeChecked();

      const profit = screen.getByLabelText("Profit");
      await user.click(profit);
      expect(profit).toBeChecked();
      expect(paydown).not.toBeChecked();
    });
  });

  describe("Adding and Removing Blocks", () => {
    it("can add a buy block and delete it", async () => {
      const user = userEvent.setup();
      render(<Build />);

      const addBtn = screen.getByTestId("add-block-button");
      await user.click(addBtn);
      await user.click(screen.getByTestId("add-buy-block"));

      await waitFor(() => {
        expect(screen.getByText("Buy Block #1")).toBeInTheDocument();
      });

      // Delete the block using the × button in the block header
      const blockHeader = screen.getByText("Buy Block #1").closest("div");
      if (!blockHeader) throw new Error("Block header not found");
      const deleteBtn = within(blockHeader as HTMLElement).getByTitle(
        "Delete block",
      );
      await user.click(deleteBtn);

      await waitFor(() => {
        expect(screen.queryByText("No blocks yet")).toBeInTheDocument();
      });
    });

    it("prevents adding more than one buy block", async () => {
      const user = userEvent.setup();
      render(<Build />);

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-buy-block"));

      await waitFor(() => {
        expect(screen.getByText("Buy Block #1")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("add-block-button"));
      const buyBtn = screen.getByTestId("add-buy-block");
      expect(buyBtn).toBeDisabled();
    });

    it("can add all block types", async () => {
      const user = userEvent.setup();
      render(<Build />);

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-buy-block"));

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-rent-block"));

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-renovate-block"));

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-refinance-block"));

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByText("Sell Block"));

      await waitFor(() => {
        expect(screen.getByText("Buy Block #1")).toBeInTheDocument();
        expect(screen.getByText("Rent Block #2")).toBeInTheDocument();
        expect(screen.getByText("Renovate Block #3")).toBeInTheDocument();
        expect(screen.getByText("Refinance Block #4")).toBeInTheDocument();
        expect(screen.getByText("Sell Block #5")).toBeInTheDocument();
      });
    });

    it("prevents adding more than one sell block", async () => {
      const user = userEvent.setup();
      render(<Build />);

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByText("Sell Block"));

      await waitFor(() => {
        expect(screen.getByText("Sell Block #1")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("add-block-button"));
      const sellBtn = screen.getByText("Sell Block");
      expect(sellBtn.closest("button")).toBeDisabled();
    });
  });

  describe("Buy Block Interactions", () => {
    it("fills out all buy block fields", async () => {
      const user = userEvent.setup();
      render(<Build />);

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-buy-block"));

      await waitFor(() => {
        expect(screen.getByTestId("buy-cost")).toBeInTheDocument();
      });

      // Use existing data-testid where available
      const costInput = screen.getByTestId("buy-cost") as HTMLInputElement;
      await user.clear(costInput);
      await user.type(costInput, "300000");
      fireEvent.blur(costInput);

      const rateInput = screen.getByTestId(
        "buy-interest-rate",
      ) as HTMLInputElement;
      await user.clear(rateInput);
      await user.type(rateInput, "5.5");
      fireEvent.blur(rateInput);

      // Use label-based helpers for the rest
      await typeByLabel(user, "Downpayment", "25");
      await typeByLabel(user, "Closing Costs", "4");
      await typeByLabel(user, "HOA (Annual)", "1200");
      await typeByLabel(user, "Property Taxes", "1.2");
      await typeByLabel(user, "Insurance (Annual)", "900");

      expect(costInput).toHaveValue("$300,000");
      expect(rateInput).toHaveValue("5.50%");
    });

    it("toggles interest only option", async () => {
      const user = userEvent.setup();
      render(<Build />);

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-buy-block"));

      const checkbox = screen.getByLabelText("Interest Only Option");
      expect(checkbox).not.toBeChecked();
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it("switches to custom loan term and enters value", async () => {
      const user = userEvent.setup();
      render(<Build />);

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-buy-block"));

      const customBtn = screen.getByRole("button", { name: "Custom" });
      await user.click(customBtn);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("e.g., 20")).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText("e.g., 20");
      await user.clear(input);
      await user.type(input, "25");
      expect(input).toHaveValue("25");
    });

    it("expands project planning and fills fields", async () => {
      const user = userEvent.setup();
      render(<Build />);

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-buy-block"));

      await expandSection(user, "Project Planning");

      await typeByLabel(user, "Income Needed", "80000");
      await typeByLabel(user, "Max Loan Based on ARV", "250000");
      await typeByLabel(user, "Initial Cash", "50000");
      await typeByLabel(user, "Saved For Renovation", "20000");
      await typeByLabel(user, "Minimum Cash For Project", "70000");

      const incomeInput = getInputForLabel("Income Needed");
      expect(incomeInput).toHaveValue("$80,000");
    });

    it("expands purchase summary and shows calculations", async () => {
      const user = userEvent.setup();
      render(<Build />);

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-buy-block"));

      // Fill in enough data to trigger calculations
      const costInput = screen.getByTestId("buy-cost") as HTMLInputElement;
      await user.clear(costInput);
      await user.type(costInput, "200000");
      fireEvent.blur(costInput);

      await typeByLabel(user, "Downpayment", "20");

      const rateInput = screen.getByTestId(
        "buy-interest-rate",
      ) as HTMLInputElement;
      await user.clear(rateInput);
      await user.type(rateInput, "5");
      fireEvent.blur(rateInput);

      // Monthly payment should appear without expanding
      await waitFor(() => {
        expect(screen.getByText("Monthly Payment")).toBeInTheDocument();
      });

      // Expand purchase summary
      await expandSection(user, "Purchase Summary");

      await waitFor(() => {
        expect(screen.getByText("Purchase Price")).toBeInTheDocument();
        expect(screen.getByText("Loan Amount")).toBeInTheDocument();
        expect(screen.getByText("Total Cash Needed")).toBeInTheDocument();
      });
    });
  });

  describe("Rent Block Interactions", () => {
    it("fills out rent block fields", async () => {
      const user = userEvent.setup();
      render(<Build />);

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-rent-block"));

      await waitFor(() => {
        expect(screen.getByTestId("rent-monthly-rent")).toBeInTheDocument();
      });

      const rentInput = screen.getByTestId(
        "rent-monthly-rent",
      ) as HTMLInputElement;
      await user.clear(rentInput);
      await user.type(rentInput, "2800");
      fireEvent.blur(rentInput);

      await typeByLabel(user, "Vacancy", "8");
      await typeByLabel(user, "Management", "10");
      await typeByLabel(user, "Maintenance", "150");
      await typeByLabel(user, "Annual Rent Increase", "3");

      expect(rentInput).toHaveValue("$2,800");
    });

    it("changes time rented months and years", async () => {
      const user = userEvent.setup();
      render(<Build />);

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-rent-block"));

      const monthsSelect = getInputForLabel("Months") as HTMLSelectElement;
      const yearsSelect = getInputForLabel("Years") as HTMLSelectElement;

      await user.selectOptions(monthsSelect, "6");
      await user.selectOptions(yearsSelect, "2");

      expect(monthsSelect).toHaveValue("6");
      expect(yearsSelect).toHaveValue("2");
    });
  });

  describe("Refinance Block Interactions", () => {
    it("configures non cash-out refinance", async () => {
      const user = userEvent.setup();
      render(<Build />);

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-refinance-block"));

      await waitFor(() => {
        expect(
          screen.getByTestId("refinance-estimated-value"),
        ).toBeInTheDocument();
      });

      const nonCashOut = screen.getByLabelText("Non Cash-out");
      expect(nonCashOut).toBeChecked();

      const estValueInput = screen.getByTestId(
        "refinance-estimated-value",
      ) as HTMLInputElement;
      await user.clear(estValueInput);
      await user.type(estValueInput, "350000");
      fireEvent.blur(estValueInput);

      await typeByLabel(user, "Closing Costs", "2");
      await typeByLabel(user, "Property Taxes (Annual)", "1");
      await typeByLabel(user, "Insurance (Annual)", "800");

      expect(estValueInput).toHaveValue("$350,000");
    });

    it("configures cash-out refinance with custom loan term", async () => {
      const user = userEvent.setup();
      render(<Build />);

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-refinance-block"));

      await waitFor(() => {
        expect(screen.getByLabelText("Cash Out")).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText("Cash Out"));
      expect(screen.getByLabelText("Cash Out")).toBeChecked();

      const estValueInput = screen.getByTestId(
        "refinance-estimated-value",
      ) as HTMLInputElement;
      await user.clear(estValueInput);
      await user.type(estValueInput, "400000");
      fireEvent.blur(estValueInput);

      // Financed amount is enabled in cash-out mode
      const financedElements = screen.getAllByTestId(
        "refinance-financed-amount",
      );
      const financedInput = financedElements.find(
        (el) => el.tagName === "INPUT",
      ) as HTMLInputElement;
      await user.clear(financedInput);
      await user.type(financedInput, "75");
      fireEvent.blur(financedInput);

      const customBtn = screen.getByRole("button", { name: "Custom" });
      await user.click(customBtn);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Enter years")).toBeInTheDocument();
      });

      const customInput = screen.getByPlaceholderText("Enter years");
      await user.clear(customInput);
      await user.type(customInput, "20");
      expect(customInput).toHaveValue("20");
    });

    it("toggles interest only loan", async () => {
      const user = userEvent.setup();
      render(<Build />);

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-refinance-block"));

      const checkbox = screen.getByLabelText("Interest Only Loan");
      expect(checkbox).not.toBeChecked();
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it("expands remaining equity section and fills fields", async () => {
      const user = userEvent.setup();
      render(<Build />);

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-refinance-block"));

      await expandSection(user, "Remaining Equity");

      await typeByLabel(user, "Amount ($)", "50000");
      await typeByLabel(user, "Percentage (%)", "20");

      const amountInput = getInputForLabel("Amount ($)");
      expect(amountInput).toHaveValue("$50,000");
    });
  });

  describe("Renovate Block Interactions", () => {
    it("adds renovation items and fills fields", async () => {
      const user = userEvent.setup();
      render(<Build />);

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-renovate-block"));

      await waitFor(() => {
        expect(screen.getByText("Renovation Items")).toBeInTheDocument();
      });

      const addItemBtn = screen.getByText("+ Add Item");
      await user.click(addItemBtn);
      await user.click(addItemBtn);

      const itemInputs = screen.getAllByPlaceholderText("Item name");
      expect(itemInputs.length).toBeGreaterThanOrEqual(2);

      await user.type(itemInputs[0], "Kitchen remodel");
      const costInputs = screen.getAllByPlaceholderText("$0");
      await user.type(costInputs[0], "15000");

      expect(itemInputs[0]).toHaveValue("Kitchen remodel");
    });

    it("fills time to renovate and ARV", async () => {
      const user = userEvent.setup();
      render(<Build />);

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-renovate-block"));

      const daysSelect = getInputForLabel("Days") as HTMLSelectElement;
      const monthsSelect = getInputForLabel("Months") as HTMLSelectElement;
      const yearsSelect = getInputForLabel("Years") as HTMLSelectElement;

      await user.selectOptions(daysSelect, "15");
      await user.selectOptions(monthsSelect, "2");
      await user.selectOptions(yearsSelect, "1");

      expect(daysSelect).toHaveValue("15");
      expect(monthsSelect).toHaveValue("2");
      expect(yearsSelect).toHaveValue("1");

      await typeByLabel(user, "After Repair Value (ARV)", "320000");
      const arvInput = getInputForLabel("After Repair Value (ARV)");
      expect(arvInput).toHaveValue("$320,000");
    });

    it("expands monthly cost to own and toggles defer interest", async () => {
      const user = userEvent.setup();
      render(<Build />);

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-renovate-block"));

      await expandSection(user, "Monthly Cost To Own");

      await typeByLabel(user, "County", "200");
      await typeByLabel(user, "Electricity", "150");

      const checkbox = screen.getByLabelText("Defer Interest Payments");
      expect(checkbox).not.toBeChecked();
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it("expands renovation summary", async () => {
      const user = userEvent.setup();
      render(<Build />);

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-renovate-block"));

      await expandSection(user, "Renovation Summary");

      await waitFor(() => {
        expect(screen.getByText("Renovation Items Cost")).toBeInTheDocument();
        expect(screen.getByText("Total Renovation Cost")).toBeInTheDocument();
      });
    });
  });

  describe("Sell Block Interactions", () => {
    it("fills out all sell block fields", async () => {
      const user = userEvent.setup();
      render(<Build />);

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByText("Sell Block"));

      await waitFor(() => {
        expect(screen.getByText("Sell Block #1")).toBeInTheDocument();
      });

      await typeByLabel(user, "Sell Price", "450000");

      const timeSelect = getInputForLabel(
        "Time to Sell (Months)",
      ) as HTMLSelectElement;
      await user.selectOptions(timeSelect, "6");
      expect(timeSelect).toHaveValue("6");

      await typeByLabel(user, "Closing Costs", "5");
      const closingInput = getInputForLabel("Closing Costs");
      expect(closingInput).toHaveValue("5.00%");
    });
  });

  describe("Block Reordering", () => {
    it("allows moving middle blocks left and right", async () => {
      const user = userEvent.setup();
      render(<Build />);

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-buy-block"));

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-rent-block"));

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-renovate-block"));

      await waitFor(() => {
        expect(screen.getByText("Buy Block #1")).toBeInTheDocument();
        expect(screen.getByText("Rent Block #2")).toBeInTheDocument();
        expect(screen.getByText("Renovate Block #3")).toBeInTheDocument();
      });

      // Move rent block down (swap with renovate)
      const rentBlockHeader = screen
        .getByText("Rent Block #2")
        .closest("div") as HTMLElement;
      const moveDownBtn = within(rentBlockHeader).getByTitle("Move right");
      await user.click(moveDownBtn);

      await waitFor(() => {
        // After swap, the labels update to reflect new positions
        expect(screen.getByText("Renovate Block #2")).toBeInTheDocument();
        expect(screen.getByText("Rent Block #3")).toBeInTheDocument();
      });

      // Move rent block back up
      const rentBlockNow = screen
        .getByText("Rent Block #3")
        .closest("div") as HTMLElement;
      const moveUpBtn = within(rentBlockNow).getByTitle("Move left");
      await user.click(moveUpBtn);

      await waitFor(() => {
        expect(screen.getByText("Rent Block #2")).toBeInTheDocument();
        expect(screen.getByText("Renovate Block #3")).toBeInTheDocument();
      });
    });

    it("disables move buttons for buy and sell blocks", async () => {
      const user = userEvent.setup();
      render(<Build />);

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-buy-block"));

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-rent-block"));

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByText("Sell Block"));

      await waitFor(() => {
        expect(screen.getByText("Buy Block #1")).toBeInTheDocument();
        expect(screen.getByText("Sell Block #3")).toBeInTheDocument();
      });

      const buyBlockHeader = screen
        .getByText("Buy Block #1")
        .closest("div") as HTMLElement;
      const buyFixedButtons =
        within(buyBlockHeader).getAllByTitle("Fixed position");
      expect(buyFixedButtons[0]).toBeDisabled();
      expect(buyFixedButtons[1]).toBeDisabled();

      const sellBlockHeader = screen
        .getByText("Sell Block #3")
        .closest("div") as HTMLElement;
      const sellFixedButtons =
        within(sellBlockHeader).getAllByTitle("Fixed position");
      expect(sellFixedButtons[0]).toBeDisabled();
      expect(sellFixedButtons[1]).toBeDisabled();
    });
  });

  describe("API Integration", () => {
    it("calls /api/build and /api/metrics when blocks change", async () => {
      const user = userEvent.setup();
      render(<Build />);

      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-buy-block"));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/build",
          expect.anything(),
        );
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/metrics",
          expect.anything(),
        );
      });
    });

    it("displays metrics returned from API", async () => {
      const user = userEvent.setup();
      mockFetchResponses({
        metricsResponse: {
          metrics: {
            roi: 18.75,
            cashOnCashReturn: 9.5,
            timeToPayOffLoan: 180,
            totalProfit: 200000,
            netPresentValue: 125000,
            annualizedRoi: 14.3,
            capRate: 7.2,
            netOperatingIncome: 30000,
            totalRoi: 55.0,
          },
        },
      });

      render(<Build />);
      await user.click(screen.getByTestId("add-block-button"));
      await user.click(screen.getByTestId("add-buy-block"));

      await waitFor(() => {
        expect(screen.getByText("18.75%")).toBeInTheDocument();
        expect(screen.getByText("$200,000")).toBeInTheDocument();
        expect(screen.getByText("$125,000")).toBeInTheDocument();
        expect(screen.getByText("$30,000")).toBeInTheDocument();
      });
    });
  });

  describe("Original Integration Test", () => {
    it("sets up blocks via UI and verifies refinance financed amount is not $0", async () => {
      const user = userEvent.setup();

      let callCount = 0;
      (global.fetch as jest.Mock).mockImplementation(async () => {
        callCount++;
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
                      cost: "177790.00",
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

      const addButton = screen.getByTestId("add-block-button");
      await user.click(addButton);
      await user.click(screen.getByTestId("add-buy-block"));

      await waitFor(() => {
        expect(screen.getByTestId("buy-cost")).toBeInTheDocument();
      });

      const buyCostInput = screen.getByTestId("buy-cost") as HTMLInputElement;
      await user.clear(buyCostInput);
      await user.type(buyCostInput, "225000");

      const buyInterestRateInput = screen.getByTestId(
        "buy-interest-rate",
      ) as HTMLInputElement;
      await user.clear(buyInterestRateInput);
      await user.type(buyInterestRateInput, "6");

      await user.click(addButton);
      await user.click(screen.getByTestId("add-rent-block"));

      await waitFor(() => {
        expect(screen.getByTestId("rent-monthly-rent")).toBeInTheDocument();
      });

      const rentMonthlyRentInput = screen.getByTestId(
        "rent-monthly-rent",
      ) as HTMLInputElement;
      await user.clear(rentMonthlyRentInput);
      await user.type(rentMonthlyRentInput, "2500");

      await user.click(addButton);
      await user.click(screen.getByTestId("add-refinance-block"));

      await waitFor(() => {
        expect(
          screen.getByTestId("refinance-estimated-value"),
        ).toBeInTheDocument();
      });

      const refinanceEstimatedValueInput = screen.getByTestId(
        "refinance-estimated-value",
      ) as HTMLInputElement;
      await user.clear(refinanceEstimatedValueInput);
      await user.type(refinanceEstimatedValueInput, "300000");

      const nonCashOutRadio = screen.getByLabelText("Non Cash-out");
      await user.click(nonCashOutRadio);

      await waitFor(() => {
        const financedAmountElements = screen.queryAllByTestId(
          "refinance-financed-amount",
        );
        expect(financedAmountElements.length).toBeGreaterThan(0);
      });

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
});
