import { calculateGraphData } from "../helpers/graph";
import { Block } from "@/types";

describe("Refinance with empty interest rate", () => {
  // An empty refinance interest rate must be treated as 0% (payment = loan /
  // term), matching the RefinanceBlock UI and getLoanInfo. Previously the graph
  // engine fell back to the buy block's rate (6%), which inflated the
  // post-refinance monthly payment from ~$470 to ~$1015 and made monthlyNet
  // far more negative than the block displayed.
  it("uses the refinance loan/term payment, not the buy block rate", () => {
    const blocks: Block[] = [
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
            incomeNeeded: "",
            maxLoanBasedOnArv: "",
            initialCash: "",
            savedForRenovation: "",
            minimumCashForProject: "",
          },
        },
      },
      {
        id: "renovate-1",
        type: "renovate",
        data: {
          items: [{ item: "", cost: "13000" }],
          timeToRenovate: { days: "", months: "3", years: "" },
          monthlyCostToOwn: {
            utilities: { county: "", electricity: "" },
            deferInterestPayments: false,
          },
          arv: "280000",
        },
      },
      {
        id: "rent-1",
        type: "rent",
        data: {
          monthlyRent: "1875",
          timeRentedMonths: "0",
          timeRentedYears: "1",
          vacancy: "0",
          vacancyType: "%",
          management: "0",
          managementType: "%",
          maintenance: "100",
          maintenanceType: "$",
          annualRentIncrease: "0",
          annualRentIncreaseType: "$",
        },
      },
      {
        id: "rent-2",
        type: "rent",
        data: {
          monthlyRent: "2100",
          timeRentedMonths: "0",
          timeRentedYears: "3",
          vacancy: "0",
          vacancyType: "%",
          management: "0",
          managementType: "%",
          maintenance: "100",
          maintenanceType: "$",
          annualRentIncrease: "0",
          annualRentIncreaseType: "%",
          durationMonths: 36,
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
          cost: "169389.00",
          costType: "$",
          interestRate: "",
          closingCosts: "",
          closingCostsType: "%",
          propertyTaxes: "1",
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

    const graphData = calculateGraphData(
      blocks,
      30,
      "profit",
      0,
      0,
      "2023-01-01",
    );

    // Refinance occurs at month 51 (renovate 3 + rent 12 + rent 36). Pick a
    // month well after that where no rent is active so monthlyNet is purely
    // the refinance payment plus fixed carrying costs.
    const postRefinanceMonth = 70;
    const monthlyNet = graphData[postRefinanceMonth].monthlyNet;

    // Empty rate -> 0% -> payment = 169389 / (30 * 12) = 470.525
    const expectedRefinancePayment = 169389 / (30 * 12);
    // After refinance, taxes switch to refinance block's value: 1% of 300000 = $3000/yr.
    // Insurance falls back to buy block ($740) since the refinance block left it empty.
    // HOA stays at $0 (buy block).
    const monthlyFixedExpenses = (0.01 * 300000) / 12 + 740 / 12;

    const impliedMortgage = -monthlyNet - monthlyFixedExpenses;
    expect(impliedMortgage).toBeCloseTo(expectedRefinancePayment, 1);

    // Guard against regressing to the old 6%-fallback payment (~$1015.74),
    // which produced a monthlyNet near -1264.74.
    expect(monthlyNet).toBeGreaterThan(-800);
  });
});
