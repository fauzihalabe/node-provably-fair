"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvablyFair = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
const os = __importStar(require("os"));
const uuid_1 = require("uuid");
class ProvablyFair {
    constructor() {
        this.serverSeed = this.generateSecureRandomString(64);
        this.secretSalt = this.generateSecureRandomString(8);
        this.nonce = 0;
        this.publicHash = this.generatePublicHash(this.serverSeed, this.secretSalt);
    }
    generateSecureRandomString(length) {
        return crypto.randomBytes(length).toString('hex');
    }
    generatePublicHash(serverSeed, secretSalt) {
        return crypto.createHash('sha256').update(serverSeed + secretSalt).digest('hex');
    }
    generateRollHash(clientSeed, serverSeed, secretSalt, nonce, bitcoinHash, max = 10000000) {
        const combinedInput = `${bitcoinHash}:${clientSeed}:${serverSeed}:${nonce}`;
        const randomNumber = crypto.createHmac('sha256', secretSalt).update(combinedInput).digest('hex');
        const decimalValue = parseInt(randomNumber.slice(0, 8), 16);
        return ((decimalValue % max) + 1).toString();
    }
    verifyRoll(clientSeed, roll, serverSeed, secretSalt, nonce, publicHash, bitcoinHash) {
        const generatedPublicHash = this.generatePublicHash(serverSeed, secretSalt);
        if (generatedPublicHash !== publicHash) {
            return false;
        }
        const generatedRoll = this.generateRollHash(clientSeed, serverSeed, secretSalt, nonce, bitcoinHash);
        return generatedRoll === roll.toString();
    }
    calculateWinProbability(winRange, totalRange = 10000000) {
        if (winRange < 1 || winRange > totalRange) {
            throw new Error('The winning range must be between 1 and the total possibilities.');
        }
        return (winRange / totalRange) * 100;
    }
    getPublicHash() {
        return this.publicHash;
    }
    getNonce() {
        return this.nonce;
    }
    incrementNonce() {
        this.nonce += 1;
    }
    rotateSeeds() {
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
    getWinInterval(percentage, totalRange = 10000000) {
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
    getWinIntervals(percentages, totalRange = 10000000) {
        let currentStart = 1;
        return percentages.map((percentage) => {
            const winRange = Math.round((percentage / 100) * totalRange);
            const end = currentStart + winRange - 1;
            const interval = [currentStart, end];
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
    async generateProvably(clientSeed, serverSeed, secretSalt, max = 10000000) {
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
    generateRandomNonce() {
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
        const uuid = (0, uuid_1.v4)();
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
    async getLatestBitcoinBlockHash() {
        const response = await axios_1.default.get('https://blockchain.info/latestblock');
        return response.data.hash;
    }
}
exports.ProvablyFair = ProvablyFair;
