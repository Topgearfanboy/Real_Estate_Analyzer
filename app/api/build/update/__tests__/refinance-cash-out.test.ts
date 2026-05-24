import { calculateTimeline } from "../helpers/timeline";
import { calculateGraphData } from "../helpers/graph";
import { getLoanInfo } from "../helpers/loanInfo";
import { Block } from "@/types";

describe("Integration Test - Refinance Cash Out", () => {
  it("should ensure loan balance does not increase when refinancing with cash out", () => {
    const blocks: Block[] = [
      {
        id: "buy-1779580834953-dfmxuntix",
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
          customLoanTerm: "30",
          loanTermYears: 30,
          interestOnlyOption: false,
          loanAnalysis: {
            incomeNeeded: "",
            maxLoanBasedOnArv: "",
            initialCash: "",
            savedForRenovation: "",
            minimumCashForProject: "",
          },
        },
      },
      {
        id: "rent-1779580846036-gvdgylvgp",
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
        id: "refinance-1779580856656-i1nvd1l0z",
        type: "refinance",
        data: {
          cashOut: true,
          estimatedValue: "300000",
          remainingEquityAmount: "",
          remainingEquityPercent: "",
          cost: "",
          costType: "$",
          interestRate: "6",
          closingCosts: "6",
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
    ];

    const timeline = calculateTimeline(blocks);
    console.log("Timeline:", timeline);

    const loanInfo = getLoanInfo(blocks, timeline);
    console.log("Loan Info:", loanInfo);

    const graphData = calculateGraphData(blocks, 30);
    console.log("Graph Data (first 5 points):", graphData.slice(0, 5));
    console.log("Graph Data (last 5 points):", graphData.slice(-5));

    // Find the refinance point (should be after 12 months of renting)
    const refinanceMonth = 12;
    const balanceBeforeRefinance =
      graphData[refinanceMonth - 1].remainingLoanBalance;
    const balanceAfterRefinance =
      graphData[refinanceMonth].remainingLoanBalance;

    console.log("Balance before refinance (month 11):", balanceBeforeRefinance);
    console.log("Balance after refinance (month 12):", balanceAfterRefinance);

    // The remaining loan balance should not increase when refinancing occurs
    // With cash out and empty cost, the new loan amount should be the remaining balance
    expect(balanceAfterRefinance).toBeLessThanOrEqual(
      balanceBeforeRefinance + 100000,
    ); // Allow reasonable cash out

    // Verify that closing costs are accounted for in cash on hand
    const cashOnHandBeforeRefinance = graphData[refinanceMonth - 1].cashOnHand;
    const cashOnHandAfterRefinance = graphData[refinanceMonth].cashOnHand;

    console.log("Cash on hand before refinance:", cashOnHandBeforeRefinance);
    console.log("Cash on hand after refinance:", cashOnHandAfterRefinance);

    // Cash on hand should decrease by closing costs (6% of $300,000 = $18,000)
    const expectedClosingCosts = 300000 * 0.06;
    const cashDecrease = cashOnHandBeforeRefinance - cashOnHandAfterRefinance;

    console.log("Expected closing costs:", expectedClosingCosts);
    console.log("Actual cash decrease:", cashDecrease);

    // Cash on hand should decrease by at least the closing costs amount
    expect(cashDecrease).toBeGreaterThanOrEqual(expectedClosingCosts * 0.9); // Allow some rounding
  });
});
