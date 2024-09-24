import { ProvablyFair } from "../src/index";
import { MockAgent, setGlobalDispatcher } from "undici";

describe("ProvablyFair Integration Tests", () => {
  let provablyFair: ProvablyFair;
  let mockAgent: MockAgent;

  beforeEach(() => {
    provablyFair = new ProvablyFair();
    mockAgent = new MockAgent();
    setGlobalDispatcher(mockAgent);
  });

  afterEach(() => {
    mockAgent.close();
  });

  test("Should generate and verify multiple rolls with different client seeds", async () => {
    const mockPool = mockAgent.get("https://blockchain.info");
    mockPool.intercept({ path: "/latestblock" }).reply(200, {
      hash: "000000000000000000002dbaa98481dea46256d80ac7aa46e80ea4ecf49ea33e",
      time: 1625097600,
      block_index: 12345,
      height: 67890,
      txIndexes: [1, 2, 3],
    });

    const clientSeeds = [
      "test1",
      "anotherTest",
      "randomSeed123",
      "clientSeed456",
    ];

    for (const clientSeed of clientSeeds) {
      const {
        randomNumber,
        serverSeed,
        secretSalt,
        nonce,
        publicHash,
        bitcoinHash,
      } = await provablyFair.generateProvably(clientSeed);

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

  test("Should generate different random numbers for consecutive calls", async () => {
    const mockPool = mockAgent.get("https://blockchain.info");
    mockPool.intercept({ path: "/latestblock" }).reply(200, {
      hash: "000000000000000000002dbaa98481dea46256d80ac7aa46e80ea4ecf49ea33e",
      time: 1625097600,
      block_index: 12345,
      height: 67890,
      txIndexes: [1, 2, 3],
    });

    const clientSeed = "testSeed";
    const results = new Set();

    for (let i = 0; i < 5; i++) {
      const { randomNumber } = await provablyFair.generateProvably(clientSeed);
      results.add(randomNumber);
    }

    expect(results.size).toBe(5);
  });

  test("Should handle invalid response format", async () => {
    const mockPool = mockAgent.get("https://blockchain.info");
    mockPool
      .intercept({ path: "/latestblock" })
      .reply(200, { invalidKey: "invalidValue" });

    await expect(provablyFair.generateProvably("testSeed")).rejects.toThrow(
      "Invalid response format from Bitcoin block API"
    );
  });

  test("Should use cached value when available", async () => {
    const mockPool = mockAgent.get("https://blockchain.info");
    mockPool.intercept({ path: "/latestblock" }).reply(200, {
      hash: "000000000000000000002dbaa98481dea46256d80ac7aa46e80ea4ecf49ea33e",
      time: 1625097600,
      block_index: 12345,
      height: 67890,
      txIndexes: [1, 2, 3],
    });

    const provablyFairWithCache = new ProvablyFair({
      useCache: true,
      cacheTTL: 1000,
    });

    await provablyFairWithCache.generateProvably("testSeed");

    mockPool.intercept({ path: "/latestblock" }).reply(200, {
      hash: "differentHash",
      time: 1625097601,
      block_index: 12346,
      height: 67891,
      txIndexes: [4, 5, 6],
    });

    const { bitcoinHash } = await provablyFairWithCache.generateProvably(
      "testSeed"
    );
    expect(bitcoinHash).toBe(
      "000000000000000000002dbaa98481dea46256d80ac7aa46e80ea4ecf49ea33e"
    );
  });
});
