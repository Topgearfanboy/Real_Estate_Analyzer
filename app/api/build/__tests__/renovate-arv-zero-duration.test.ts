import { calculateTimeline } from "../helpers/timeline";
import { calculateGraphData } from "../helpers/graph";
import { getLoanInfo } from "../helpers/loanInfo";
import { Block } from "@/types";

describe("Integration Test - Buy + Rent + Renovate with ARV and 0 Duration", () => {
  it("should handle renovation with 0 duration and ARV correctly", () => {
    const blocks: Block[] = [
      {
        id: "buy-1780448197708-esjnguvdf",
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
        id: "rent-1780448201398-dyee39n95",
        type: "rent",
        data: {
          monthlyRent: "2500",
          timeRentedMonths: "0",
          timeRentedYears: "4",
          vacancy: "5",
          vacancyType: "%",
          management: "8",
          managementType: "%",
          maintenance: "100",
          maintenanceType: "$",
          annualRentIncrease: "0",
          annualRentIncreaseType: "%",
          durationMonths: 48,
        },
      },
      {
        id: "renovate-1780448231080-2mowlaeib",
        type: "renovate",
        data: {
          items: [
            {
              item: "thing",
              cost: "10000",
            },
          ],
          timeToRenovate: {
            days: "1",
            months: "",
            years: "",
          },
          monthlyCostToOwn: {
            utilities: {
              county: "",
              electricity: "",
            },
            deferInterestPayments: false,
          },
          arv: "300000",
        },
      },
    ];

    const timeline = calculateTimeline(blocks);
    console.log("Timeline:", timeline);

    const loanInfo = getLoanInfo(blocks, timeline);
    console.log("Loan Info:", loanInfo);

    const graphData = calculateGraphData(
      blocks,
      30,
      "profit",
      0,
      0,
      "2024-01-01",
    );
    console.log("Graph Data (first 5 points):", graphData.slice(0, 5));
    console.log("Graph Data (around renovation):", graphData.slice(47, 52));
    console.log("Graph Data (last 5 points):", graphData.slice(-5));

    // Verify the timeline has all blocks
    expect(timeline).toHaveLength(3);
    expect(timeline[0].type).toBe("buy");
    expect(timeline[1].type).toBe("rent");
    expect(timeline[2].type).toBe("renovate");

    // Verify loan info is calculated
    expect(loanInfo.monthlyPayment).toBeGreaterThan(0);
    expect(loanInfo.loanEndDate).not.toBeNull();
    expect(loanInfo.loanStartIndex).toBeGreaterThanOrEqual(0);

    // Verify graph data is generated
    expect(graphData.length).toBeGreaterThan(0);
    expect(graphData[0].investedCapital).toBeGreaterThanOrEqual(45000); // 20% of 225,000
    expect(graphData[0].remainingLoanBalance).toBeCloseTo(179821, 0); // 225,000 - 20% - 3% closing costs

    // Verify cash on hand accumulates during rent period
    const cashOnHandBeforeRenovation = graphData[47].cashOnHand; // Month 48 (0-indexed, so 47)
    expect(cashOnHandBeforeRenovation).toBeGreaterThan(0);

    // Verify renovation cost is applied when renovation completes
    // Rent runs months 0-47 (4 years), so renovation starts at month 48.
    // The full ~$10,000 cost is applied at month 48, so the cash-on-hand drop
    // (renovation cost plus the loss of rental income) appears between 47->48.
    const cashOnHandMonth47 = graphData[47].cashOnHand;
    const cashOnHandMonth48 = graphData[48].cashOnHand;
    const cashOnHandDecrease = cashOnHandMonth47 - cashOnHandMonth48;
    // The decrease should be at least $10,000 (renovation cost)
    expect(cashOnHandDecrease).toBeGreaterThanOrEqual(10000);

    // Verify ARV updates property value at the renovation completion month (48)
    const equityBeforeArv = graphData[47].equity;
    const equityAfterArv = graphData[48].equity;

    console.log("Equity before ARV:", equityBeforeArv);
    console.log("Equity after ARV:", equityAfterArv);

    // Equity should increase significantly after ARV is applied (property value jumps to $300,000)
    expect(equityAfterArv).toBeGreaterThan(equityBeforeArv);

    // Verify equity after ARV is approximately $300,000 - remaining loan balance
    const remainingLoanBalanceAtMonth48 = graphData[48].remainingLoanBalance;
    const expectedEquity = 300000 - remainingLoanBalanceAtMonth48;
    expect(equityAfterArv).toBeCloseTo(expectedEquity, -2); // Allow some rounding
  });
});
