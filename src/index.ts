import axios from 'axios';
import * as crypto from 'crypto';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';

export class ProvablyFair {
  private serverSeed: string;
  private secretSalt: string;
  private publicHash: string;
  private nonce: number;

  constructor() {
    this.serverSeed = this.generateSecureRandomString(64);
    this.secretSalt = this.generateSecureRandomString(8);
    this.nonce = 0;
    this.publicHash = this.generatePublicHash(this.serverSeed, this.secretSalt);
  }

  private generateSecureRandomString(length: number): string {
    return crypto.randomBytes(length).toString('hex');
  }

  private generatePublicHash(serverSeed: string, secretSalt: string): string {
    return crypto.createHash('sha256').update(serverSeed + secretSalt).digest('hex');
  }

  private generateRollHash(clientSeed: string, serverSeed: string, secretSalt: string, nonce: number, bitcoinHash: string, max: number = 10000000): string {
    const combinedInput = `${bitcoinHash}:${clientSeed}:${serverSeed}:${nonce}`;
    const randomNumber = crypto.createHmac('sha256', secretSalt).update(combinedInput).digest('hex');
    const decimalValue = parseInt(randomNumber.slice(0, 8), 16);
    return ((decimalValue % max) + 1).toString();
  }

  public verifyRoll(
    clientSeed: string,
    roll: number,
    serverSeed: string,
    secretSalt: string,
    nonce: number,
    publicHash: string,
    bitcoinHash: string
  ): boolean {
    const generatedPublicHash = this.generatePublicHash(serverSeed, secretSalt);
    if (generatedPublicHash !== publicHash) {
      return false;
    }
    const generatedRoll = this.generateRollHash(clientSeed, serverSeed, secretSalt, nonce, bitcoinHash);
    return generatedRoll === roll.toString();
  }

  public calculateWinProbability(winRange: number, totalRange: number = 10000000): number {
    if (winRange < 1 || winRange > totalRange) {
      throw new Error('The winning range must be between 1 and the total possibilities.');
    }
    return (winRange / totalRange) * 100;
  }

  public getPublicHash(): string {
    return this.publicHash;
  }

  public getNonce(): number {
    return this.nonce;
  }

  public incrementNonce(): void {
    this.nonce += 1;
  }

  public rotateSeeds(): void {
    this.serverSeed = this.generateSecureRandomString(64);
    this.secretSalt = this.generateSecureRandomString(8);
    this.publicHash = this.generatePublicHash(this.serverSeed, this.secretSalt);
    this.nonce = 0; // Reset nonce on seed rotation
  }

  /**
   * Returns a win interval based on the provided percentage.
   * @param percentage - The desired win percentage.
   * @param totalRange - The total possibilities (usually 10,000,000).
   * @returns The win interval corresponding to the percentage.
   */
  public getWinInterval(percentage: number, totalRange: number = 10000000): { percentage: number, interval: [number, number] } {
    const winRange = Math.round((percentage / 100) * totalRange); // calculate the size of the winning range based on the percentage
    const end = totalRange; // The end will always be the totalRange
    const start = totalRange - winRange + 1; // Calculate the start to ensure the range ends at the totalRange
    return {
      percentage,
      interval: [start, end]
    };
  }


  /**
   * Returns an array of intervals based on a provided array of percentages.
   * @param percentages - An array of percentages.
   * @param totalRange - The total possibilities (usually 10,000,000).
   * @returns An array of objects containing percentage and corresponding interval.
   */
  public getWinIntervals(percentages: number[], totalRange: number = 10000000): { percentage: number, interval: [number, number] }[] {
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
   * Generates a random number based on the hash of the latest Bitcoin blockchain block.
   * @param clientSeed - The client seed.
   * @param serverSeed - The server seed (optional, generated if not provided).
   * @param secretSalt - The secret salt (optional, generated if not provided).
   * @param max - The desired maximum range.
   * @returns An object containing the generated number, serverSeed, secretSalt, nonce, clientSeed, and publicHash used.
   */
  public async generateProvably(
    clientSeed: string,
    serverSeed?: string,
    secretSalt?: string,
    max: number = 10000000
  ): Promise<{ randomNumber: number, serverSeed: string, secretSalt: string, nonce: number, clientSeed: string, publicHash: string, bitcoinHash: string }> {
    const bitcoinHash = await this.getLatestBitcoinBlockHash();
    const nonce = this.generateRandomNonce(); // Generating random nonce

    // Use provided values or generate new ones
    const finalServerSeed = serverSeed || this.generateSecureRandomString(64);
    const finalSecretSalt = secretSalt || this.generateSecureRandomString(8);

    // Generating public hash
    const publicHash = this.generatePublicHash(finalServerSeed, finalSecretSalt);

    const combinedInput = `${bitcoinHash}:${clientSeed}:${finalServerSeed}:${nonce}`;
    const randomNumber = crypto.createHmac('sha256', finalSecretSalt).update(combinedInput).digest('hex');
    const decimalValue = parseInt(randomNumber.slice(0, 8), 16);

    return {
      randomNumber: (decimalValue % max) + 1,
      serverSeed: finalServerSeed,
      secretSalt: finalSecretSalt,
      nonce,
      clientSeed,
      publicHash,
      bitcoinHash
    };
  }

  /**
   * Generates a random nonce with extra entropy for maximum randomness.
   * @returns A random integer.
   */
  private generateRandomNonce(): number {
    const timeComponent = Date.now(); // Current time

    // Get additional entropy from the system
    const systemEntropy = [
      process.pid, // Process ID
      os.uptime(), // System uptime
      os.freemem(), // Free memory
      os.loadavg()[0] // System load average
    ].join('-');

    const randomBuffer1 = crypto.randomBytes(8); // Generate 8 bytes of additional entropy
    const randomBuffer2 = crypto.randomBytes(8);
    const randomValue1 = randomBuffer1.readUInt32BE(0);
    const randomValue2 = randomBuffer2.readUInt32BE(0);

    // Generate a UUID v4 to add more entropy
    const uuid = uuidv4();

    // Combine all entropy sources
    const combinedValue = `${timeComponent}-${systemEntropy}-${randomValue1}-${randomValue2}-${uuid}`;

    // Apply a final hash to ensure uniformity
    const hash = crypto.createHash('sha256').update(combinedValue).digest('hex');

    // Convert to a number
    return parseInt(hash.slice(0, 8), 16);
  }

  /**
   * Retrieves the latest Bitcoin blockchain block hash using Blockchain.info API.
   * @returns The latest block hash.
   */
  private async getLatestBitcoinBlockHash(): Promise<string> {
    const response = await axios.get('https://blockchain.info/latestblock');
    return response.data.hash;
  }
}
