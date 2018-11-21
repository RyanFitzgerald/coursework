import formatMoney from "../lib/formatMoney";

describe("formatMoney Function", () => {
  it("works with fractional dollars", () => {
    expect(formatMoney(1)).toEqual("$0.01");
    expect(formatMoney(10)).toEqual("$0.10");
  });

  it("leaves cents off for whole dollars", () => {
    expect(formatMoney(100)).toEqual("$1");
    expect(formatMoney(5000)).toEqual("$50");
  });

  it("adds commas for >= $1000", () => {
    expect(formatMoney(100000)).toEqual("$1,000");
    expect(formatMoney(1000001)).toEqual("$10,000.01");
  });
});
