import { calculateGraphData } from "../helpers/graph";
import { Block } from "@/types";

describe("Integration Test - Multiple Rent Blocks", () => {
  it("should calculate graph data correctly with multiple rent blocks and refinance", () => {
    // Create blocks matching the user's specifications
    const blocks: Block[] = [
      {
        id: "buy-1779631094437-8glwe2pdl",
        type: "buy",
        data: {
          cost: "225000",
          interestRate: "6",
          downpayment: "20",
          downpaymentType: "%",
          closingCosts: "3",
          closingCostsType: "%",
          propertyTaxes: "1.05",
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
        id: "rent-1779631143477-l1jotc18g",
        type: "rent",
        data: {
          monthlyRent: "2500",
          timeRentedMonths: "0",
          timeRentedYears: "6",
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
        id: "refinance-1779631321136-g458uyl9q",
        type: "refinance",
        data: {
          cashOut: false,
          estimatedValue: "300000",
          remainingEquityAmount: "",
          remainingEquityPercent: "",
          cost: "164260.00",
          costType: "$",
          interestRate: "2",
          closingCosts: "",
          closingCostsType: "%",
          propertyTaxes: "1.04",
          propertyTaxesType: "%",
          homeownersInsurance: "740",
          homeownersInsuranceType: "$",
          loanTerm: "30",
          customLoanTerm: "",
          loanTermYears: 30,
          annualHoa: "0",
          interestOnlyOption: false,
        },
      },
      {
        id: "rent-1779631399819-uuzqo41jb",
        type: "rent",
        data: {
          monthlyRent: "2500",
          timeRentedMonths: "0",
          timeRentedYears: "21",
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
    ];

    // Calculate graph data for 30 years with paydown strategy and $10,000 cash holding balance
    const graphData = calculateGraphData(
      blocks,
      30,
      "paydown",
      10000,
      0,
      "2024-01-01T12:00:00",
    );

    // Verify the graph data has the expected length (30 years * 12 months = 360 months)
    expect(graphData.length).toBe(360);

    // Verify key behaviors for multiple rent blocks
    // First month (2024-01)
    expect(graphData[0].date).toBe("2024-01");
    expect(graphData[0].investedCapital).toBe(45000);
    expect(graphData[0].remainingLoanBalance).toBeGreaterThan(0);
    expect(graphData[0].monthlyNet).toBeGreaterThan(0);

    // During first rent period, cash on hand should grow and then cap at 10000
    const firstRentPeriodEnd = 71; // 6 years = 72 months, index 71
    expect(graphData[firstRentPeriodEnd].date).toBe("2029-12");
    expect(graphData[firstRentPeriodEnd].cashOnHand).toBe(10000);

    // Refinance happens at month 72 (2030-01)
    const refinanceMonth = 72;
    expect(graphData[refinanceMonth].date).toBe("2030-01");
    // Cash on hand should drop due to refinance costs
    expect(graphData[refinanceMonth].cashOnHand).toBeLessThan(10000);
    // Monthly net should be negative due to refinance costs
    expect(graphData[refinanceMonth].monthlyNet).toBeLessThan(0);

    // Second rent period starts at month 73 (2030-02)
    const secondRentStart = 73;
    expect(graphData[secondRentStart].date).toBe("2030-02");
    // Cash on hand should recover
    expect(graphData[secondRentStart].cashOnHand).toBe(10000);
    // Monthly net should be positive again
    expect(graphData[secondRentStart].monthlyNet).toBeGreaterThan(0);

    // Verify loan gets paid off at some point
    const loanPaidOffMonth = graphData.findIndex(
      (point) => point.remainingLoanBalance === 0,
    );
    expect(loanPaidOffMonth).toBeGreaterThan(0);
    expect(loanPaidOffMonth).toBeLessThan(graphData.length);

    // After loan is paid off, monthly net should increase (no more mortgage payment)
    const afterLoanPaidOff = graphData[loanPaidOffMonth + 1];
    expect(afterLoanPaidOff.remainingLoanBalance).toBe(0);
    expect(afterLoanPaidOff.monthlyNet).toBeGreaterThan(
      graphData[loanPaidOffMonth - 1].monthlyNet,
    );

    // Second rent period (21 years = 252 months) starts after refinance at month 72
    // So it should end around month 72 + 252 = 324
    // Verify that monthly net is positive during the second rent period
    const secondRentPeriodCheck = 200; // Check a point well into the second rent period
    expect(graphData[secondRentPeriodCheck].monthlyNet).toBeGreaterThan(0);

    // Last month (2053-12)
    expect(graphData[359].date).toBe("2053-12");
    expect(graphData[359].remainingLoanBalance).toBe(0);
    expect(graphData[359].equity).toBeGreaterThan(0);
  });
});
