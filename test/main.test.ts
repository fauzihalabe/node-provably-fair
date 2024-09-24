import { ProvablyFair } from "../src/index";
jest.setTimeout(30000); // Set timeout to 30 seconds (30000 ms)

describe("ProvablyFair", () => {
  let provablyFair: ProvablyFair;

  beforeEach(() => {
    provablyFair = new ProvablyFair();
  });

  test("Should generate a valid win interval for a percentage", () => {
    const percentage = 0.05;
    const result = provablyFair.getWinInterval(percentage);
    console.log("Result for getWinInterval:", result);
    expect(result.percentage).toBe(percentage);
    expect(result.interval[0]).toBeGreaterThanOrEqual(1);
    expect(result.interval[1]).toBeLessThanOrEqual(10000000);
    expect(result.interval[0]).toBeLessThan(result.interval[1]);
  });

  test("Should generate valid win intervals for multiple percentages", () => {
    const percentages = [20, 20, 20, 20, 20];
    const result = provablyFair.getWinIntervals(percentages);

    console.log("Result for getWinIntervals:", result);

    result.forEach((entry, index) => {
      expect(entry.percentage).toBe(percentages[index]);
      expect(entry.interval[0]).toBeGreaterThanOrEqual(1);
      expect(entry.interval[1]).toBeLessThanOrEqual(10000000);
      expect(entry.interval[0]).toBeLessThan(entry.interval[1]);
    });

    for (let i = 1; i < result.length; i++) {
      expect(result[i].interval[0]).toBe(result[i - 1].interval[1] + 1);
    }
  });

  test("Should generate 10 consecutive random numbers based on Bitcoin block hash and verify each roll", async () => {
    const clientSeed = "c57f23440d2f4fa79549314790d9b074";

    const rolls: {
      randomNumber: number;
      serverSeed: string;
      secretSalt: string;
      nonce: number;
      publicHash: string;
      bitcoinHash: string;
    }[] = [];

    for (let i = 1; i <= 10; i++) {
      const {
        randomNumber,
        serverSeed,
        secretSalt,
        nonce,
        publicHash,
        bitcoinHash,
      } = await provablyFair.generateProvably(clientSeed);
      rolls.push({
        randomNumber,
        serverSeed,
        secretSalt,
        nonce,
        publicHash,
        bitcoinHash,
      });

      console.log(`Roll ${i} - Roll:`, randomNumber);

      expect(randomNumber).toBeGreaterThanOrEqual(1);
      expect(randomNumber).toBeLessThanOrEqual(10000000);

      const isValid = provablyFair.verifyRoll(
        clientSeed,
        randomNumber,
        serverSeed,
        secretSalt,
        nonce,
        publicHash,
        bitcoinHash
      );
      expect(isValid).toBe(true);
    }
  });
});
