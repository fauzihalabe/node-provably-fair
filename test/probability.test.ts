import { ProvablyFair } from "../src/index";

describe("ProvablyFair Probability Calculations", () => {
  let provablyFair: ProvablyFair;

  beforeEach(() => {
    provablyFair = new ProvablyFair();
  });

  test("Should calculate correct win probability", () => {
    expect(provablyFair.calculateWinProbability(500000)).toBe(5);
    expect(provablyFair.calculateWinProbability(1000000)).toBe(10);
    expect(provablyFair.calculateWinProbability(100000, 1000000)).toBe(10);
  });

  test("Should throw error for invalid win range", () => {
    expect(() => provablyFair.calculateWinProbability(0)).toThrow();
    expect(() => provablyFair.calculateWinProbability(10000001)).toThrow();
  });

  test("Should generate correct win intervals for edge cases", () => {
    const lowPercentage = provablyFair.getWinInterval(0.0001);
    expect(lowPercentage.interval[1] - lowPercentage.interval[0]).toBe(9);

    const highPercentage = provablyFair.getWinInterval(99.9999);
    expect(highPercentage.interval[1] - highPercentage.interval[0]).toBe(
      9999989
    );
  });
});
