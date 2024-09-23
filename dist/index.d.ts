export declare class ProvablyFair {
    private serverSeed;
    private secretSalt;
    private publicHash;
    private nonce;
    constructor();
    private generateSecureRandomString;
    private generatePublicHash;
    private generateRollHash;
    verifyRoll(clientSeed: string, roll: number, serverSeed: string, secretSalt: string, nonce: number, publicHash: string, bitcoinHash: string): boolean;
    calculateWinProbability(winRange: number, totalRange?: number): number;
    getPublicHash(): string;
    getNonce(): number;
    incrementNonce(): void;
    rotateSeeds(): void;
    /**
     * Returns a win interval based on the provided percentage.
     * @param percentage - The desired win percentage.
     * @param totalRange - The total possibilities (usually 10,000,000).
     * @returns The win interval corresponding to the percentage.
     */
    getWinInterval(percentage: number, totalRange?: number): {
        percentage: number;
        interval: [number, number];
    };
    /**
     * Returns an array of intervals based on a provided array of percentages.
     * @param percentages - An array of percentages.
     * @param totalRange - The total possibilities (usually 10,000,000).
     * @returns An array of objects containing percentage and corresponding interval.
     */
    getWinIntervals(percentages: number[], totalRange?: number): {
        percentage: number;
        interval: [number, number];
    }[];
    /**
     * Generates a random number based on the hash of the latest Bitcoin blockchain block.
     * @param clientSeed - The client seed.
     * @param serverSeed - The server seed (optional, generated if not provided).
     * @param secretSalt - The secret salt (optional, generated if not provided).
     * @param max - The desired maximum range.
     * @returns An object containing the generated number, serverSeed, secretSalt, nonce, clientSeed, and publicHash used.
     */
    generateProvably(clientSeed: string, serverSeed?: string, secretSalt?: string, max?: number): Promise<{
        randomNumber: number;
        serverSeed: string;
        secretSalt: string;
        nonce: number;
        clientSeed: string;
        publicHash: string;
        bitcoinHash: string;
    }>;
    /**
     * Generates a random nonce with extra entropy for maximum randomness.
     * @returns A random integer.
     */
    private generateRandomNonce;
    /**
     * Retrieves the latest Bitcoin blockchain block hash using Blockchain.info API.
     * @returns The latest block hash.
     */
    private getLatestBitcoinBlockHash;
}
