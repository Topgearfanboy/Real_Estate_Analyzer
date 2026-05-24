import { calculateGraphData } from "../graph";
import { Block } from "@/types";

describe("calculateGraphData", () => {
  it("should return static data when no buy block exists", () => {
    const blocks: Block[] = [
      {
        id: "1",
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
    ];
    const result = calculateGraphData(blocks);
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe("2024-01");
    expect(result[0].investedCapital).toBe(0);
    expect(result[0].cashOnHand).toBe(0);
    expect(result[0].equity).toBe(0);
    expect(result[0].remainingLoanBalance).toBe(0);
  });

  it("should generate graph data for 30 years by default", () => {
    const blocks: Block[] = [
      {
        id: "1",
        type: "buy",
        data: {
          cost: "$100000",
          downpayment: "$20000",
          downpaymentType: "$",
          interestRate: "5",
          loanTerm: "30",
          customLoanTerm: "",
          interestOnlyOption: false,
          propertyTaxes: "3600",
          propertyTaxesType: "$",
          homeownersInsurance: "1200",
          homeownersInsuranceType: "$",
          annualHoa: "0",
          closingCosts: "0",
          closingCostsType: "$",
          loanTermYears: 30,
          loanAnalysis: {
            incomeNeeded: "0",
            maxLoanBasedOnArv: "0",
            initialCash: "0",
            savedForRenovation: "0",
            minimumCashForProject: "0",
          },
        },
      },
    ];
    const result = calculateGraphData(blocks);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].date).toBe("2024-01");
    expect(result[0].investedCapital).toBe(20000); // downpayment
  });

  it("should limit data points based on years parameter", () => {
    const blocks: Block[] = [
      {
        id: "1",
        type: "buy",
        data: {
          cost: "$100000",
          downpayment: "$20000",
          downpaymentType: "$",
          interestRate: "5",
          loanTerm: "30",
          customLoanTerm: "",
          interestOnlyOption: false,
          propertyTaxes: "3600",
          propertyTaxesType: "$",
          homeownersInsurance: "1200",
          homeownersInsuranceType: "$",
          annualHoa: "0",
          closingCosts: "0",
          closingCostsType: "$",
          loanTermYears: 30,
          loanAnalysis: {
            incomeNeeded: "0",
            maxLoanBasedOnArv: "0",
            initialCash: "0",
            savedForRenovation: "0",
            minimumCashForProject: "0",
          },
        },
      },
    ];
    const result = calculateGraphData(blocks, 5); // 5 years
    expect(result.length).toBeLessThanOrEqual(60); // 5 years * 12 months
  });

  it("should generate correct date strings", () => {
    const blocks: Block[] = [
      {
        id: "1",
        type: "buy",
        data: {
          cost: "$100000",
          downpayment: "$20000",
          downpaymentType: "$",
          interestRate: "5",
          loanTerm: "30",
          customLoanTerm: "",
          interestOnlyOption: false,
          propertyTaxes: "3600",
          propertyTaxesType: "$",
          homeownersInsurance: "1200",
          homeownersInsuranceType: "$",
          annualHoa: "0",
          closingCosts: "0",
          closingCostsType: "$",
          loanTermYears: 30,
          loanAnalysis: {
            incomeNeeded: "0",
            maxLoanBasedOnArv: "0",
            initialCash: "0",
            savedForRenovation: "0",
            minimumCashForProject: "0",
          },
        },
      },
    ];
    const result = calculateGraphData(blocks, 1); // 1 year
    expect(result[0].date).toBe("2024-01");
    expect(result[11].date).toBe("2024-12");
  });
});
