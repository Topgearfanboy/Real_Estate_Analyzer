import { Block } from "@/types";
import { blockDurationMonths, monthOverlap } from "../timeline";
import { calculateGraphData } from "../graph";

describe("fractional-month duration helpers", () => {
  it("blockDurationMonths keeps partial days as fractional months", () => {
    const renovate: Block = {
      id: "r",
      type: "renovate",
      data: {
        items: [],
        timeToRenovate: { days: "15", months: "", years: "" },
        monthlyCostToOwn: {
          utilities: { county: "", electricity: "" },
          deferInterestPayments: false,
        },
        arv: "",
      },
    };
    expect(blockDurationMonths(renovate)).toBeCloseTo(0.5, 10); // 15 / 30
  });

  it("monthOverlap returns the fraction of a calendar month covered", () => {
    // Window [0.5, 12.5): first month half-covered, last month half-covered.
    expect(monthOverlap(0, 0.5, 12)).toBeCloseTo(0.5, 10);
    expect(monthOverlap(1, 0.5, 12)).toBeCloseTo(1, 10);
    expect(monthOverlap(12, 0.5, 12)).toBeCloseTo(0.5, 10);
    expect(monthOverlap(13, 0.5, 12)).toBe(0);
  });
});

describe("renovation-to-rent proration", () => {
  // Buy with 0% interest and no taxes/insurance/HOA isolates the mortgage
  // principal payment (constant each month), so monthlyNet differences reflect
  // only the prorated rent income.
  const blocks: Block[] = [
    {
      id: "buy",
      type: "buy",
      data: {
        cost: "120000",
        interestRate: "0",
        downpayment: "0",
        downpaymentType: "$",
        closingCosts: "0",
        closingCostsType: "$",
        propertyTaxes: "0",
        propertyTaxesType: "$",
        annualHoa: "0",
        homeownersInsurance: "0",
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
      id: "renovate",
      type: "renovate",
      data: {
        items: [], // no cost, so only the 15-day timing shifts the rent start
        timeToRenovate: { days: "15", months: "", years: "" },
        monthlyCostToOwn: {
          utilities: { county: "", electricity: "" },
          deferInterestPayments: false,
        },
        arv: "",
      },
    },
    {
      id: "rent",
      type: "rent",
      data: {
        monthlyRent: "2000",
        timeRentedMonths: "0",
        timeRentedYears: "1", // 12 months
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

  it("prorates the first and last rent months by the 15-day (half month) shift", () => {
    const graphData = calculateGraphData(
      blocks,
      5,
      "profit",
      0,
      0,
      "2024-01-01",
    );

    // Rent window is [0.5, 12.5): month 0 and month 12 are each half-rent,
    // months 1-11 are full-rent, months 13+ have no rent.
    const fullVsHalfFirst = graphData[1].monthlyNet - graphData[0].monthlyNet;
    const fullVsHalfLast = graphData[12].monthlyNet - graphData[13].monthlyNet;

    // The missing half-month of rent is $1000 in both the first and last months.
    expect(fullVsHalfFirst).toBeCloseTo(1000, 4);
    expect(fullVsHalfLast).toBeCloseTo(1000, 4);

    // First and last (both half) months contribute the same rent.
    expect(graphData[0].monthlyNet).toBeCloseTo(graphData[12].monthlyNet, 4);

    // A full rent month contributes a full $2000 more than a no-rent month.
    expect(graphData[5].monthlyNet - graphData[13].monthlyNet).toBeCloseTo(
      2000,
      4,
    );
  });
});

describe("renovation negative-net proration across partial months", () => {
  // 0% interest, no taxes/insurance isolates the mortgage principal payment
  // (120000 / 360 = $333.33/mo) so monthlyNet = rent income - renovation cost
  // spread - mortgage. The renovation runs 2.5 months ($15,000 total), then
  // rent begins immediately, so month index 2 is a transition month that is
  // half renovation and half rent.
  const blocks: Block[] = [
    {
      id: "buy",
      type: "buy",
      data: {
        cost: "120000",
        interestRate: "0",
        downpayment: "0",
        downpaymentType: "$",
        closingCosts: "0",
        closingCostsType: "$",
        propertyTaxes: "0",
        propertyTaxesType: "$",
        annualHoa: "0",
        homeownersInsurance: "0",
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
      id: "renovate",
      type: "renovate",
      data: {
        items: [{ item: "reno", cost: "15000" }],
        timeToRenovate: { days: "15", months: "2", years: "" }, // 2.5 months
        monthlyCostToOwn: {
          utilities: { county: "", electricity: "" },
          deferInterestPayments: false,
        },
        arv: "",
      },
    },
    {
      id: "rent",
      type: "rent",
      data: {
        monthlyRent: "2000",
        timeRentedMonths: "0",
        timeRentedYears: "1",
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

  it("prorates the renovation cost by month overlap (half cost in the half month)", () => {
    const graphData = calculateGraphData(
      blocks,
      5,
      "profit",
      0,
      0,
      "2024-01-01",
    );

    const mortgage = 120000 / 360; // 333.33
    const renoPerMonth = 15000 / 2.5; // 6000 over the 2.5-month window

    // Months 0 and 1 are full renovation months: -reno/mo - mortgage.
    expect(graphData[0].monthlyNet).toBeCloseTo(-renoPerMonth - mortgage, 2);
    expect(graphData[1].monthlyNet).toBeCloseTo(-renoPerMonth - mortgage, 2);

    // Month 2 is half renovation (-$3000) and half rent (+$1000): the negative
    // renovation portion is prorated to exactly half.
    expect(graphData[2].monthlyNet).toBeCloseTo(
      -renoPerMonth * 0.5 + 2000 * 0.5 - mortgage,
      2,
    );

    // Month 3 onward is full rent, no renovation.
    expect(graphData[3].monthlyNet).toBeCloseTo(2000 - mortgage, 2);

    // The total renovation cost charged across all months equals $15,000.
    const totalRenoCharged = graphData.reduce((sum, point, i) => {
      // Reconstruct the renovation portion: rent income and mortgage are known.
      const rentOverlap = Math.max(
        0,
        Math.min(i + 1, 2.5 + 12) - Math.max(i, 2.5),
      );
      const rentPortion = 2000 * rentOverlap;
      const renoPortion = point.monthlyNet - rentPortion + mortgage;
      return sum + (renoPortion < 0 ? -renoPortion : 0);
    }, 0);
    expect(totalRenoCharged).toBeCloseTo(15000, 2);
  });
});
