import { calculateTimeline } from "../helpers/timeline";
import { calculateGraphData } from "../helpers/graph";
import { getLoanInfo } from "../helpers/loanInfo";
import { Block } from "@/types";

describe("Integration Test - Refinance Balance", () => {
  it("should calculate accurate remaining loan balance with refinance", () => {
    // Create blocks matching the user's specifications
    const blocks: Block[] = [
      {
        id: "1",
        type: "buy",
        data: {
          cost: "$225,000",
          downpayment: "20",
          downpaymentType: "%",
          interestRate: "6",
          loanTerm: "1",
          customLoanTerm: "",
          interestOnlyOption: false,
          propertyTaxes: "1",
          propertyTaxesType: "%",
          homeownersInsurance: "740",
          homeownersInsuranceType: "$",
          annualHoa: "0",
          closingCosts: "3",
          closingCostsType: "%",
          loanTermYears: 1,
          loanAnalysis: {
            incomeNeeded: "0",
            maxLoanBasedOnArv: "0",
            initialCash: "0",
            savedForRenovation: "0",
            minimumCashForProject: "0",
          },
        },
      },
      {
        id: "2",
        type: "rent",
        data: {
          timeRentedMonths: "12",
          timeRentedYears: "0",
          monthlyRent: "2000",
          vacancy: "0",
          vacancyType: "$",
          management: "0",
          managementType: "$",
          maintenance: "0",
          maintenanceType: "$",
          annualRentIncrease: "0",
          annualRentIncreaseType: "%",
        },
      },
      {
        id: "3",
        type: "refinance",
        data: {
          cost: "80",
          costType: "%",
          interestRate: "6",
          loanTerm: "30",
          customLoanTerm: "",
          interestOnlyOption: false,
          propertyTaxes: "0",
          propertyTaxesType: "%",
          homeownersInsurance: "0",
          homeownersInsuranceType: "$",
          annualHoa: "0",
          closingCosts: "0",
          closingCostsType: "%",
          loanTermYears: 30,
          loanStartDate: "",
          cashOut: false,
          estimatedValue: "300,000",
          remainingEquityAmount: "0",
          remainingEquityPercent: "0",
        },
      },
    ];

    // Calculate timeline
    const timeline = calculateTimeline(blocks);
    console.log("Timeline:", timeline);

    // Get loan info (should use refinance)
    const loanInfo = getLoanInfo(blocks, timeline);
    console.log("Loan Info:", loanInfo);

    // Calculate graph data
    const graphData = calculateGraphData(blocks, 30);

    // Verify the refinance monthly payment is close to expected $1,439
    expect(loanInfo.monthlyPayment).toBeCloseTo(1439, 0); // Allow some rounding

    // Verify remaining loan balance decreases over time
    const firstBalance = graphData[0].remainingLoanBalance;
    const lastBalance = graphData[graphData.length - 1].remainingLoanBalance;

    // Balance should decrease over time
    expect(lastBalance).toBeLessThan(firstBalance);

    // After 30 years, the refinance loan won't be fully paid off because it's a new 30-year loan
    // that starts at year 1, so it has 29 years remaining in the 30-year timeframe
    expect(lastBalance).toBeGreaterThan(0);

    // Verify the balance at month 12 (after 1 year, before refinance)
    // Initial loan: $225,000 - 20% = $180,000
    // After 12 payments at 6% interest over 1 year (loan should be paid off)
    const month12Balance = graphData[11].remainingLoanBalance;

    // With a 1-year loan, it should be paid off by month 12
    expect(month12Balance).toBe(0);

    // Verify the balance after refinance (month 13 onwards)
    // Refinance: 80% of $300,000 = $240,000 new loan
    const month13Balance = graphData[12].remainingLoanBalance;

    // After refinance, balance should jump up to ~$240,000
    expect(month13Balance).toBeCloseTo(240000, -3); // Allow some rounding
  });
});
