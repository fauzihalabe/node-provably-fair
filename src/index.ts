import { fetch } from "undici";
import { v4 as uuidv4 } from "uuid";
import * as crypto from "crypto";
import * as os from "os";

interface CacheEntry {
  value: string;
  expiry: number;
}

interface ProvablyFairOptions {
  /** Whether to use caching for Bitcoin block hash. Default is true. */
  useCache?: boolean;
  /** Time-to-live for cached values in milliseconds. Default is 60000 (1 minute). */
  cacheTTL?: number;
  /** Length of the server seed in bytes. Default is 32. */
  serverSeedLength?: number;
  /** Length of the secret salt in bytes. Default is 4. */
  secretSaltLength?: number;
  /** Timeout of {getLatestBitcoinBlockHash}. Default is 5000 (5 seconds). */
  fetchTimeout?: number;
}

/**
 * Interface for the expected response from the Bitcoin block API
 */
interface BitcoinBlockResponse {
  hash: string;
  time: number;
  block_index: number;
  height: number;
  txIndexes: number[];
}

/**
 * Type guard to check if the response matches the BitcoinBlockResponse interface
 * @param data - The data to check
 * @returns True if the data matches the BitcoinBlockResponse interface, false otherwise
 */
function isBitcoinBlockResponse(data: unknown): data is BitcoinBlockResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "hash" in data &&
    typeof (data as BitcoinBlockResponse).hash === "string"
  );
}

export class ProvablyFair {
  private readonly serverSeed: Buffer;
  private readonly secretSalt: Buffer;
  private readonly publicHash: Buffer;
  private nonce: number;
  private cache: { [key: string]: CacheEntry } = {};
  private readonly cacheTTL: number;
  private readonly useCache: boolean;
  private readonly fetchTimeout: number;

  /**
   * Creates an instance of ProvablyFair.
   * @param {ProvablyFairOptions} [options] - Configuration options for the ProvablyFair instance.
   */

  constructor(options: ProvablyFairOptions = {}) {
    const {
      useCache = true,
      cacheTTL = 60000,
      serverSeedLength = 32,
      secretSaltLength = 4,
      fetchTimeout = 5000,
    } = options;

    this.useCache = useCache;
    this.cacheTTL = cacheTTL;
    this.serverSeed = crypto.randomBytes(serverSeedLength);
    this.secretSalt = crypto.randomBytes(secretSaltLength);
    this.nonce = 0;
    this.publicHash = this.generatePublicHash(this.serverSeed, this.secretSalt);
    this.fetchTimeout = fetchTimeout;
  }

  /**
   * Generates a public hash from the server seed and secret salt.
   * @param {Buffer} serverSeed - The server seed.
   * @param {Buffer} secretSalt - The secret salt.
   * @returns {Buffer} The generated public hash.
   * @private
   */
  private generatePublicHash(serverSeed: Buffer, secretSalt: Buffer): Buffer {
    return crypto
      .createHash("sha256")
      .update(Buffer.concat([serverSeed, secretSalt]))
      .digest();
  }

  /**
   * Generates a roll number based on input parameters.
   * @param {string} clientSeed - The client seed.
   * @param {Buffer} serverSeed - The server seed.
   * @param {Buffer} secretSalt - The secret salt.
   * @param {number} nonce - The nonce value.
   * @param {string} bitcoinHash - The Bitcoin block hash.
   * @param {number} [max=10000000] - The maximum value for the roll.
   * @returns {number} The generated roll number.
   * @private
   */
  private generateRoll(
    clientSeed: string,
    serverSeed: Buffer,
    secretSalt: Buffer,
    nonce: number,
    bitcoinHash: string,
    max: number = 10000000
  ): number {
    const hmac = crypto.createHmac("sha256", secretSalt);
    hmac.update(
      Buffer.from(
        `${bitcoinHash}:${clientSeed}:${serverSeed.toString("hex")}:${nonce}`
      )
    );
    const hash = hmac.digest();
    const decimalValue = hash.readUInt32BE(0);
    return (decimalValue % max) + 1;
  }

  /**
   * Verifies a roll against the provided parameters.
   * @param {string} clientSeed - The client seed.
   * @param {number} roll - The roll number to verify.
   * @param {string} serverSeed - The server seed as a hexadecimal string.
   * @param {string} secretSalt - The secret salt as a hexadecimal string.
   * @param {number} nonce - The nonce value.
   * @param {string} publicHash - The public hash as a hexadecimal string.
   * @param {string} bitcoinHash - The Bitcoin block hash.
   * @returns {boolean} True if the roll is verified, false otherwise.
   */
  public verifyRoll(
    clientSeed: string,
    roll: number,
    serverSeed: string,
    secretSalt: string,
    nonce: number,
    publicHash: string,
    bitcoinHash: string
  ): boolean {
    const serverSeedBuffer = Buffer.from(serverSeed, "hex");
    const secretSaltBuffer = Buffer.from(secretSalt, "hex");
    const generatedPublicHash = this.generatePublicHash(
      serverSeedBuffer,
      secretSaltBuffer
    );
    if (!generatedPublicHash.equals(Buffer.from(publicHash, "hex"))) {
      return false;
    }
    const generatedRoll = this.generateRoll(
      clientSeed,
      serverSeedBuffer,
      secretSaltBuffer,
      nonce,
      bitcoinHash
    );
    return generatedRoll === roll;
  }

  /**
   * Calculates the win probability based on the winning range and total range.
   * @param {number} winRange - The winning range.
   * @param {number} [totalRange=10000000] - The total range.
   * @returns {number} The calculated win probability as a percentage.
   * @throws {Error} If the winning range is invalid.
   */
  public calculateWinProbability(
    winRange: number,
    totalRange: number = 10000000
  ): number {
    if (winRange < 1 || winRange > totalRange) {
      throw new Error(
        "The winning range must be between 1 and the total possibilities."
      );
    }
    return (winRange / totalRange) * 100;
  }

  /**
   * Gets the public hash.
   * @returns {string} The public hash as a hexadecimal string.
   */
  public getPublicHash(): string {
    return this.publicHash.toString("hex");
  }

  /**
   * Gets the current nonce value.
   * @returns {number} The current nonce.
   */
  public getNonce(): number {
    return this.nonce;
  }

  /**
   * Increments the nonce value.
   */
  public incrementNonce(): void {
    this.nonce++;
  }

  /**
   * Rotates the seeds and resets the nonce.
   */
  public rotateSeeds(): void {
    this.serverSeed.fill(crypto.randomBytes(this.serverSeed.length));
    this.secretSalt.fill(crypto.randomBytes(this.secretSalt.length));
    this.publicHash.fill(
      this.generatePublicHash(this.serverSeed, this.secretSalt)
    );
    this.nonce = 0;
  }

  /**
   * Returns a win interval based on the provided percentage.
   * @param {number} percentage - The desired win percentage.
   * @param {number} [totalRange=10000000] - The total possibilities.
   * @returns {{ percentage: number; interval: [number, number] }} An object containing the percentage and corresponding interval.
   */
  public getWinInterval(
    percentage: number,
    totalRange: number = 10000000
  ): { percentage: number; interval: [number, number] } {
    const winRange = Math.round((percentage / 100) * totalRange);
    const end = totalRange;
    const start = totalRange - winRange + 1;
    return { percentage, interval: [start, end] };
  }

  /**
   * Returns an array of intervals based on a provided array of percentages.
   * @param {number[]} percentages - An array of percentages.
   * @param {number} [totalRange=10000000] - The total possibilities.
   * @returns {{ percentage: number; interval: [number, number] }[]} An array of objects containing percentage and corresponding interval.
   */
  public getWinIntervals(
    percentages: number[],
    totalRange: number = 10000000
  ): { percentage: number; interval: [number, number] }[] {
    let currentStart = 1;
    return percentages.map((percentage) => {
      const winRange = Math.round((percentage / 100) * totalRange);
      const end = currentStart + winRange - 1;
      const interval: [number, number] = [currentStart, end];
      currentStart = end + 1;
      return { percentage, interval };
    });
  }

  /**
   * Generates a provably fair random number based on the hash of the latest Bitcoin blockchain block.
   * @param {string} clientSeed - The client seed.
   * @param {number} [max=10000000] - The maximum value for the random number.
   * @returns {Promise<{
   *   randomNumber: number;
   *   serverSeed: string;
   *   secretSalt: string;
   *   nonce: number;
   *   clientSeed: string;
   *   publicHash: string;
   *   bitcoinHash: string;
   * }>} A promise that resolves to an object containing the generated number and associated data.
   */
  public async generateProvably(
    clientSeed: string,
    max: number = 10000000
  ): Promise<{
    randomNumber: number;
    serverSeed: string;
    secretSalt: string;
    nonce: number;
    clientSeed: string;
    publicHash: string;
    bitcoinHash: string;
  }> {
    const bitcoinHash = await this.getLatestBitcoinBlockHash();
    const nonce = this.generateRandomNonce();

    const randomNumber = this.generateRoll(
      clientSeed,
      this.serverSeed,
      this.secretSalt,
      nonce,
      bitcoinHash,
      max
    );

    return {
      randomNumber,
      serverSeed: this.serverSeed.toString("hex"),
      secretSalt: this.secretSalt.toString("hex"),
      nonce,
      clientSeed,
      publicHash: this.publicHash.toString("hex"),
      bitcoinHash,
    };
  }

  /**
   * Generates a random nonce with extra entropy for maximum randomness.
   * @returns {number} A random integer to be used as a nonce.
   * @private
   */
  private generateRandomNonce(): number {
    const timeComponent = BigInt(Date.now());
    const pidComponent = BigInt(process.pid);
    const uptimeComponent = BigInt(Math.floor(os.uptime() * 1000));
    const freeMemComponent = BigInt(os.freemem());
    const loadAvgComponent = BigInt(Math.floor(os.loadavg()[0] * 1000));

    const uuidBuffer = Buffer.from(uuidv4(), "utf-8");
    const uuidComponent = uuidBuffer.readBigUInt64BE(0);

    const randomBuffer = crypto.randomBytes(8);
    const randomComponent = randomBuffer.readBigUInt64BE(0);

    const combinedValue =
      timeComponent ^
      pidComponent ^
      uptimeComponent ^
      freeMemComponent ^
      loadAvgComponent ^
      uuidComponent ^
      randomComponent;

    const hash = crypto
      .createHash("sha256")
      .update(combinedValue.toString())
      .digest();
    return hash.readUInt32BE(0);
  }

  /**
   * Retrieves the latest Bitcoin blockchain block hash.
   * @returns {Promise<string>} A promise that resolves to the latest block hash.
   * @throws {Error} If fetching the latest Bitcoin block hash fails.
   * @private
   */
  private async getLatestBitcoinBlockHash(): Promise<string> {
    if (this.useCache) {
      const cacheKey = "latestBitcoinBlockHash";
      const cachedValue = this.getCachedValue(cacheKey);
      if (cachedValue) {
        return cachedValue;
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.fetchTimeout);

      const response = await fetch("https://blockchain.info/latestblock", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: unknown = await response.json();

      if (!isBitcoinBlockResponse(data)) {
        throw new Error("Invalid response format from Bitcoin block API");
      }

      const hash = data.hash;

      if (this.useCache) {
        this.setCachedValue("latestBitcoinBlockHash", hash);
      }
      return hash;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(
            "Request timed out while fetching the latest Bitcoin block hash"
          );
        }
        throw new Error(
          `Failed to fetch the latest Bitcoin block hash: ${error.message}`
        );
      }
      throw new Error(
        "An unknown error occurred while fetching the latest Bitcoin block hash"
      );
    }
  }

  /**
   * Retrieves a cached value if it exists and hasn't expired.
   * @param {string} key - The key of the cached value.
   * @returns {string | null} The cached value if it exists and hasn't expired, null otherwise.
   * @private
   */
  private getCachedValue(key: string): string | null {
    const entry = this.cache[key];
    if (entry && entry.expiry > Date.now()) {
      return entry.value;
    }
    return null;
  }

  /**
   * Sets a value in the cache with an expiry time.
   * @param {string} key - The key to store the value under.
   * @param {string} value - The value to store.
   * @private
   */
  private setCachedValue(key: string, value: string): void {
    this.cache[key] = {
      value,
      expiry: Date.now() + this.cacheTTL,
    };
  }
}
