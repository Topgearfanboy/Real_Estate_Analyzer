import { processBuyBlockData } from "../buyBlock";
import { Block } from "@/types";

describe("processBuyBlockData", () => {
  it("should return null when no buy block exists", () => {
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
    const result = processBuyBlockData(blocks);
    expect(result).toBeNull();
  });

  it("should return null when blocks array is empty", () => {
    const blocks: Block[] = [];
    const result = processBuyBlockData(blocks);
    expect(result).toBeNull();
  });

  it("should process buy block with dollar downpayment", () => {
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
    const result = processBuyBlockData(blocks);
    expect(result).not.toBeNull();
    expect(result?.cost).toBe(100000);
    expect(result?.downpayment).toBe(20000);
    expect(result?.loanAmount).toBe(80000);
    expect(result?.monthlyRate).toBe(5);
    expect(result?.loanTermYears).toBe(30);
  });

  it("should process buy block with percentage downpayment", () => {
    const blocks: Block[] = [
      {
        id: "1",
        type: "buy",
        data: {
          cost: "$100000",
          downpayment: "20",
          downpaymentType: "%",
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
    const result = processBuyBlockData(blocks);
    expect(result).not.toBeNull();
    expect(result?.cost).toBe(100000);
    expect(result?.downpayment).toBe(20000); // 20% of 100000
    expect(result?.loanAmount).toBe(80000);
  });

  it("should handle cost with commas", () => {
    const blocks: Block[] = [
      {
        id: "1",
        type: "buy",
        data: {
          cost: "$100,000",
          downpayment: "$20,000",
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
    const result = processBuyBlockData(blocks);
    expect(result?.cost).toBe(100000);
    expect(result?.downpayment).toBe(20000);
  });
});
