import { calculateTimeline } from "../timeline";
import { Block } from "@/types";

describe("calculateTimeline", () => {
  it("should handle empty blocks array", () => {
    const blocks: Block[] = [];
    const timeline = calculateTimeline(blocks);
    expect(timeline).toEqual([]);
  });

  it("should handle buy block (instant block)", () => {
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
    const timeline = calculateTimeline(blocks);
    expect(timeline).toHaveLength(1);
    expect(timeline[0].type).toBe("buy");
    expect(timeline[0].startDate).toEqual(new Date(2024, 0, 1));
    expect(timeline[0].endDate).toEqual(new Date(2024, 0, 1));
  });

  it("should handle renovate block with days", () => {
    const blocks: Block[] = [
      {
        id: "1",
        type: "renovate",
        data: {
          timeToRenovate: {
            days: "30",
            months: "0",
            years: "0",
          },
          items: [],
          monthlyCostToOwn: {
            utilities: {
              county: "",
              electricity: "",
            },
            deferInterestPayments: false,
          },
        },
      },
    ];
    const timeline = calculateTimeline(blocks);
    expect(timeline).toHaveLength(1);
    expect(timeline[0].type).toBe("renovate");
    expect(timeline[0].startDate).toEqual(new Date(2024, 0, 1));
    expect(timeline[0].endDate).toEqual(new Date(2024, 1, 1)); // 30 days rounds to 1 month
  });

  it("should handle renovate block with months", () => {
    const blocks: Block[] = [
      {
        id: "1",
        type: "renovate",
        data: {
          timeToRenovate: {
            days: "0",
            months: "6",
            years: "0",
          },
          items: [],
          monthlyCostToOwn: {
            utilities: {
              county: "",
              electricity: "",
            },
            deferInterestPayments: false,
          },
        },
      },
    ];
    const timeline = calculateTimeline(blocks);
    expect(timeline).toHaveLength(1);
    expect(timeline[0].type).toBe("renovate");
    expect(timeline[0].startDate).toEqual(new Date(2024, 0, 1));
    expect(timeline[0].endDate).toEqual(new Date(2024, 6, 1)); // 6 months later
  });

  it("should handle renovate block with years", () => {
    const blocks: Block[] = [
      {
        id: "1",
        type: "renovate",
        data: {
          timeToRenovate: {
            days: "0",
            months: "0",
            years: "1",
          },
          items: [],
          monthlyCostToOwn: {
            utilities: {
              county: "",
              electricity: "",
            },
            deferInterestPayments: false,
          },
        },
      },
    ];
    const timeline = calculateTimeline(blocks);
    expect(timeline).toHaveLength(1);
    expect(timeline[0].type).toBe("renovate");
    expect(timeline[0].startDate).toEqual(new Date(2024, 0, 1));
    expect(timeline[0].endDate).toEqual(new Date(2025, 0, 1)); // 1 year later
  });

  it("should handle rent block", () => {
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
    const timeline = calculateTimeline(blocks);
    expect(timeline).toHaveLength(1);
    expect(timeline[0].type).toBe("rent");
    expect(timeline[0].startDate).toEqual(new Date(2024, 0, 1));
    expect(timeline[0].endDate).toEqual(new Date(2025, 0, 1)); // 12 months later
  });

  it("should sequence multiple blocks correctly", () => {
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
        type: "renovate",
        data: {
          timeToRenovate: {
            days: "0",
            months: "6",
            years: "0",
          },
          items: [],
          monthlyCostToOwn: {
            utilities: {
              county: "",
              electricity: "",
            },
            deferInterestPayments: false,
          },
        },
      },
    ];
    const timeline = calculateTimeline(blocks);
    expect(timeline).toHaveLength(2);
    expect(timeline[0].type).toBe("buy");
    expect(timeline[0].startDate).toEqual(new Date(2024, 0, 1));
    expect(timeline[0].endDate).toEqual(new Date(2024, 0, 1));
    expect(timeline[1].type).toBe("renovate");
    expect(timeline[1].startDate).toEqual(new Date(2024, 0, 1));
    expect(timeline[1].endDate).toEqual(new Date(2024, 6, 1));
  });
});
