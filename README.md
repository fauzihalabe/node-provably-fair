# Provably Fair Random Number Generator

A provably fair system for generating and verifying random numbers based on blockchain data. Ideal for applications where fairness, transparency, and verifiability are essential, such as in gaming and lotteries.

## Installation

You can install this package using npm:

```
npm install node-provably-fair
```

or using yarn:

```
yarn add node-provably-fair
```

## How It Works

This package generates verifiably random numbers by combining blockchain data (Bitcoin block hashes) with seeds and salts provided by both the server and client. This ensures that the results are tamper-proof and transparent.

### Why Use Provably Fair?

- **Transparency**: All random numbers generated can be verified by the client, as they are based on public blockchain data and cryptographic seeds.
- **Security**: By using client-provided seeds along with server-generated salts and seeds, the system ensures that results cannot be manipulated.
- **Fairness**: The numbers are generated using a combination of Bitcoin block hashes, client seeds, and server seeds, making them provably random and unbiased.
- **Caching**: Implemented caching for Bitcoin block hash requests to improve performance.
- **Configurable Options**: Configuration options for caching, timeouts, and seed lengths.
- **Error Handling**: Error handling for network issues and invalid responses.
- **Performance**: Using `undici` for faster HTTP requests.

---

## Usage

### 1. Import and Initialize

```typescript
import { ProvablyFair } from "node-provably-fair";

const provablyFair = new ProvablyFair({
  useCache: true,
  cacheTTL: 60000,
  fetchTimeout: 5000,
  serverSeedLength: 32,
  secretSaltLength: 4,
});
```

#### Configuration Options

- **useCache**: (boolean, default: true) Whether to use caching for Bitcoin block hash requests.
- **cacheTTL**: (number, default: 60000) Time-to-live for cached values in milliseconds.
- **fetchTimeout**: (number, default: 5000) Timeout for fetch requests in milliseconds.
- **serverSeedLength**: (number, default: 32) Length of the server seed in bytes.
- **secretSaltLength**: (number, default: 4) Length of the secret salt in bytes.

### 2. Generate Provably Fair Random Numbers

This function generates a provably fair random number using blockchain data.

#### `generateProvably(clientSeed, max?)`

- **clientSeed**: _(required)_ A seed provided by the client to ensure their involvement in the generation process.
- **max**: _(optional, default: 10,000,000)_ The maximum value for the random number generated.

#### Example:

```typescript
try {
  const result = await provablyFair.generateProvably("clientSeed123");
  console.log(result);
} catch (error) {
  console.error("Error generating random number:", error.message);
}
```

#### Response:

- **randomNumber**: The random number generated.
- **serverSeed**: The server seed used (provided or generated).
- **secretSalt**: The secret salt used (provided or generated).
- **nonce**: A unique number used once to ensure randomness.
- **clientSeed**: The client seed used.
- **publicHash**: The public hash generated from the server seed and the secret salt.
- **bitcoinHash**: The hash of the last Bitcoin block used in the generation.

#### Response example:

```typescript
{
  randomNumber: 8756223,
  serverSeed: 'ab12cd34...',
  secretSalt: 'ef56gh78...',
  nonce: 123456,
  clientSeed: 'clientSeed123',
  publicHash: 'a3b5f69...',
  bitcoinHash: '000000000000000000...'
}
```

### 3. Verifying a Roll

This function allows you to verify that a generated random number is fair by comparing the values used to generate it.

#### `verifyRoll(clientSeed, roll, serverSeed, secretSalt, nonce, publicHash, bitcoinHash)`

#### Example:

```typescript
const isValid = provablyFair.verifyRoll(
  clientSeed,
  randomNumber,
  serverSeed,
  secretSalt,
  nonce,
  publicHash,
  bitcoinHash
);

console.log(isValid); // true or false
```

### 4. Get a Win Interval

This function returns an interval range for winning based on a given percentage.

#### `getWinInterval(percentage, totalRange?)`

- **percentage**: _(required)_ The desired win percentage.
- **totalRange**: _(optional, default: 10,000,000)_ The total possibilities.

#### Example:

```typescript
const winInterval = provablyFair.getWinInterval(15); // 15% win rate
console.log(winInterval);
```

#### Response example:

```typescript
{
  percentage: 15,
  interval: [1500001, 3000000]
}
```

### 5. Get Multiple Win Intervals

This function returns an array of win intervals for multiple percentages.

#### `getWinIntervals(percentages, totalRange?)`

#### Example:

```typescript
const winIntervals = provablyFair.getWinIntervals([20, 20, 20, 20, 20]);
console.log(winIntervals);
```

#### Response example:

```typescript
[
  { percentage: 20, interval: [1, 2000000] },
  { percentage: 20, interval: [2000001, 4000000] },
  { percentage: 20, interval: [4000001, 6000000] },
  { percentage: 20, interval: [6000001, 8000000] },
  { percentage: 20, interval: [8000001, 10000000] },
];
```

### 6. Rotate Seeds

This function generates new server seeds and salts, resetting the nonce to zero.

#### `rotateSeeds()`

#### Example:

```typescript
provablyFair.rotateSeeds();
```

### 7. Getters for Public Data

You can retrieve the public hash, nonce, or other important data using getters.

#### `getPublicHash()`

- Returns the current public hash generated from the server seed and secret salt.

#### Example:

```typescript
const publicHash = provablyFair.getPublicHash();
console.log(publicHash);
```

#### `getNonce()`

- Returns the current nonce used.

#### Example:

```typescript
const publicHash = provablyFair.getPublicHash();
const nonce = provablyFair.getNonce();
```

### 8. Calculate Win Probability

This function calculates the win probability based on a win range and a total range of possibilities.

#### `calculateWinProbability(winRange, totalRange?)`

- **winRange**: _(required)_ The size of the win range.
- **totalRange**: _(optional, default: 10,000,000)_ The total possible range.

#### Example:

```typescript
const probability = provablyFair.calculateWinProbability(1000000); // 1,000,000 out of 10,000,000
console.log(probability); // 10%
```

---

## Error Handling

The ProvablyFair class now includes improved error handling. When using the `generateProvably` method, it's recommended to use try-catch blocks to handle potential errors:

```typescript
try {
  const result = await provablyFair.generateProvably("clientSeed123");
  // Process the result
} catch (error) {
  if (error instanceof Error) {
    console.error("Error generating random number:", error.message);
    // Handle specific error cases if needed
  }
}
```

---

## License

This package is licensed under the [MIT License](LICENSE).

---

## Conclusion

With **Provably Fair**, you can ensure that random numbers are generated securely and transparently, making it ideal for applications where trust and fairness are critical, such as in gaming and gambling.

Feel free to contribute or raise any issues on the [GitHub repository](https://github.com/fauzihalabe/node-provably-fair).
