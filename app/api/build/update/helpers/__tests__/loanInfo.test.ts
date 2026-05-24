import { getLoanInfo } from "../loanInfo";
import { Block } from "@/types";
import { TimelineEntry } from "../timeline";

describe("getLoanInfo", () => {
  const mockTimeline: TimelineEntry[] = [
    {
      type: "buy",
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 0, 1),
    },
    {
      type: "refinance",
      startDate: new Date(2024, 6, 1),
      endDate: new Date(2024, 6, 1),
    },
  ];

  it("should return default values when no loan block exists", () => {
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
    const result = getLoanInfo(blocks, mockTimeline);
    expect(result.monthlyPayment).toBe(0);
    expect(result.loanEndDate).toBeNull();
    expect(result.loanStartIndex).toBe(-1);
  });

  it("should process buy block and calculate monthly payment", () => {
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
    const result = getLoanInfo(blocks, mockTimeline);
    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(result.loanEndDate).not.toBeNull();
    expect(result.loanStartIndex).toBe(0);
  });

  it("should prefer refinance block over buy block", () => {
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
      {
        id: "2",
        type: "refinance",
        data: {
          cost: "$120000",
          costType: "$",
          interestRate: "4.5",
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
          loanStartDate: "",
          cashOut: false,
          estimatedValue: "150000",
          remainingEquityAmount: "30000",
          remainingEquityPercent: "20",
        },
      },
    ];
    const result = getLoanInfo(blocks, mockTimeline);
    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(result.loanStartIndex).toBe(1); // Should use refinance
  });

  it("should handle 0% interest rate", () => {
    const blocks: Block[] = [
      {
        id: "1",
        type: "buy",
        data: {
          cost: "$100000",
          downpayment: "$20000",
          downpaymentType: "$",
          interestRate: "0",
          loanTerm: "30",
          customLoanTerm: "",
          interestOnlyOption: false,
          propertyTaxes: "0",
          propertyTaxesType: "$",
          homeownersInsurance: "0",
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
    const result = getLoanInfo(blocks, mockTimeline);
    expect(result.monthlyPayment).toBe(80000 / 360); // Loan amount / 360 months
  });
});
