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
      throw new Error('O intervalo de acerto deve estar entre 1 e o total de possibilidades.');
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
   * Retorna um intervalo de vitória baseado na porcentagem fornecida.
   * @param percentage - A porcentagem de vitória desejada.
   * @param totalRange - O total de possibilidades (geralmente 10.000.000).
   * @returns O intervalo de vitória correspondente à porcentagem.
   */
  public getWinInterval(percentage: number, totalRange: number = 10000000): { percentage: number, interval: [number, number] } {
    const winRange = Math.round((percentage / 100) * totalRange);
    const start = Math.floor(Math.random() * (totalRange - winRange + 1)) + 1;
    const end = start + winRange - 1;
    return {
      percentage,
      interval: [start, end]
    };
  }

  /**
   * Retorna um array de intervalos baseados em um array de porcentagens fornecido.
   * @param percentages - Um array de porcentagens.
   * @param totalRange - O total de possibilidades (geralmente 10.000.000).
   * @returns Um array de objetos contendo porcentagem e intervalo correspondente.
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
   * Gera um número aleatório baseado no hash do último bloco da blockchain Bitcoin.
   * @param clientSeed - A seed do cliente.
   * @param serverSeed - A seed do servidor (opcional, gerada se não for fornecida).
   * @param secretSalt - O salt secreto (opcional, gerado se não for fornecido).
   * @param max - O valor máximo do intervalo desejado.
   * @returns Um objeto contendo o número gerado, serverSeed, secretSalt, nonce, clientSeed e publicHash utilizados.
   */
  public async generateRandomNumberFromBitcoin(
    clientSeed: string,
    serverSeed?: string,
    secretSalt?: string,
    max: number = 10000000
  ): Promise<{ randomNumber: number, serverSeed: string, secretSalt: string, nonce: number, clientSeed: string, publicHash: string, bitcoinHash: string }> {
    const bitcoinHash = await this.getLatestBitcoinBlockHash();
    const nonce = this.generateRandomNonce(); // Gerando nonce aleatório

    // Usa os valores fornecidos ou gera novos
    const finalServerSeed = serverSeed || this.generateSecureRandomString(64);
    const finalSecretSalt = secretSalt || this.generateSecureRandomString(8);

    // Gerando public hash
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
   * Gera um nonce aleatório com entropia extra para máxima aleatoriedade.
   * @returns Um número inteiro aleatório.
   */
  private generateRandomNonce(): number {
    const timeComponent = Date.now(); // Tempo atual

    // Pega entropia adicional do sistema
    const systemEntropy = [
        process.pid, // ID do processo
        os.uptime(), // Tempo de atividade do sistema
        os.freemem(), // Memória livre
        os.loadavg()[0] // Média de carga do sistema
    ].join('-');

    const randomBuffer1 = crypto.randomBytes(8); // Gera 8 bytes de entropia adicional
    const randomBuffer2 = crypto.randomBytes(8);
    const randomValue1 = randomBuffer1.readUInt32BE(0);
    const randomValue2 = randomBuffer2.readUInt32BE(0);

    // Gera um UUID v4 para adicionar mais entropia
    const uuid = uuidv4();

    // Combina todas as fontes de entropia
    const combinedValue = `${timeComponent}-${systemEntropy}-${randomValue1}-${randomValue2}-${uuid}`;

    // Aplica um hash final para garantir uniformidade
    const hash = crypto.createHash('sha256').update(combinedValue).digest('hex');

    // Converte para número
    return parseInt(hash.slice(0, 8), 16);
  }

  /**
   * Obtém o hash do último bloco da blockchain Bitcoin usando a API do Blockchain.info.
   * @returns O hash do último bloco.
   */
  private async getLatestBitcoinBlockHash(): Promise<string> {
    const response = await axios.get('https://blockchain.info/latestblock');
    return response.data.hash;
  }
}
