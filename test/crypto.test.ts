import { ProvablyFair } from "../src/index";

describe("ProvablyFair Cryptographic Operations", () => {
  let provablyFair: ProvablyFair;

  beforeEach(() => {
    provablyFair = new ProvablyFair();
  });

  test("Should generate a valid public hash", () => {
    const publicHash = provablyFair.getPublicHash();
    expect(publicHash).toMatch(/^[a-f0-9]{64}$/);
  });

  test("Should rotate seeds and generate a new public hash", () => {
    const initialPublicHash = provablyFair.getPublicHash();
    provablyFair.rotateSeeds();
    const newPublicHash = provablyFair.getPublicHash();
    expect(newPublicHash).not.toBe(initialPublicHash);
    expect(newPublicHash).toMatch(/^[a-f0-9]{64}$/);
  });

  test("Should increment nonce", () => {
    const initialNonce = provablyFair.getNonce();
    provablyFair.incrementNonce();
    expect(provablyFair.getNonce()).toBe(initialNonce + 1);
  });
});
