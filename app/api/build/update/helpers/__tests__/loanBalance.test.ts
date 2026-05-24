import { calculateLoanBalanceOverTime } from "../loanBalance";

describe("calculateLoanBalanceOverTime", () => {
  it("should calculate loan balance with 0% interest rate", () => {
    const result = calculateLoanBalanceOverTime(100000, 0, 30);
    expect(result.balances).toHaveLength(360); // 30 years * 12 months
    expect(result.balances[0]).toBeCloseTo(99722); // Balance after first payment
    expect(result.balances[359]).toBe(0); // Paid off at end
    expect(result.monthsToPayoff).toBe(359); // Last month balance is 0
  });

  it("should calculate loan balance with positive interest rate", () => {
    const result = calculateLoanBalanceOverTime(100000, 5, 30);
    expect(result.balances).toHaveLength(360);
    expect(result.balances[0]).toBeCloseTo(99880); // Balance after first payment
    expect(result.balances[359]).toBe(0);
    expect(result.monthsToPayoff).toBe(359); // Last month balance is 0
  });

  it("should handle custom months parameter", () => {
    const result = calculateLoanBalanceOverTime(100000, 5, 30, 12);
    expect(result.balances).toHaveLength(12);
    expect(result.balances[0]).toBeCloseTo(99880); // Balance after first payment
  });

  it("should return zero balance when loan amount is zero", () => {
    const result = calculateLoanBalanceOverTime(0, 5, 30);
    expect(result.balances).toHaveLength(360);
    expect(result.balances[0]).toBe(0);
  });

  it("should handle short loan term", () => {
    const result = calculateLoanBalanceOverTime(100000, 5, 5);
    expect(result.balances).toHaveLength(60); // 5 years * 12 months
    expect(result.balances[0]).toBeCloseTo(98530); // Balance after first payment
    expect(result.balances[59]).toBe(0);
  });
});
