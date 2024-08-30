import { ProvablyFair } from '../src/index'; // Ajuste o caminho conforme necessário
jest.setTimeout(30000); // Define o timeout para 30 segundos (30000 ms)

describe('ProvablyFair', () => {
    let provablyFair: ProvablyFair;

    beforeEach(() => {
        provablyFair = new ProvablyFair();
    });

    // test('Deve gerar um intervalo de vitória válido para uma porcentagem', () => {
    //     const percentage = 15;
    //     const result = provablyFair.getWinInterval(percentage);
    //     console.log('Resultado para getWinInterval:', result);
    //     expect(result.percentage).toBe(percentage);
    //     expect(result.interval[0]).toBeGreaterThanOrEqual(1);
    //     expect(result.interval[1]).toBeLessThanOrEqual(10000000);
    //     expect(result.interval[0]).toBeLessThan(result.interval[1]);
    // });

    // test('Deve gerar intervalos de vitória válidos para múltiplas porcentagens', () => {
    //     const percentages = [5, 10, 15];
    //     const result = provablyFair.getWinIntervals(percentages);

    //     console.log('Resultado para getWinIntervals:', result);

    //     // Validando cada intervalo
    //     result.forEach((entry, index) => {
    //         console.log(`Intervalo para porcentagem ${percentages[index]}%:`, entry.interval);
    //         expect(entry.percentage).toBe(percentages[index]);
    //         expect(entry.interval[0]).toBeGreaterThanOrEqual(1);
    //         expect(entry.interval[1]).toBeLessThanOrEqual(10000000);
    //         expect(entry.interval[0]).toBeLessThan(entry.interval[1]);
    //     });

    //     // Garantindo que os intervalos são consecutivos e não sobrepostos
    //     for (let i = 1; i < result.length; i++) {
    //         expect(result[i].interval[0]).toBe(result[i - 1].interval[1] + 1);
    //     }
    // });

    test('Deve gerar 10 números aleatórios consecutivos baseados no hash do bloco Bitcoin e verificar cada giro', async () => {
        const clientSeed = 'c57f23440d2f4fa79549314790d9b074';

        const rolls: {
            randomNumber: number,
            serverSeed: string,
            secretSalt: string,
            nonce: number,
            publicHash: string,
            bitcoinHash: string
        }[] = [];  // Declaração explícita do tipo para o array

        for (let i = 1; i <= 20; i++) {
            const { randomNumber, serverSeed, secretSalt, nonce, publicHash, bitcoinHash } = await provablyFair.generateRandomNumberFromBitcoin(clientSeed);
            rolls.push({ randomNumber, serverSeed, secretSalt, nonce, publicHash, bitcoinHash });

            console.log(`Roll ${i} - Número aleatório gerado a partir do Bitcoin:`, randomNumber);
            // console.log(`Roll ${i} - Server Seed:`, serverSeed);
            // console.log(`Roll ${i} - Secret Salt:`, secretSalt);
            // console.log(`Roll ${i} - Nonce:`, nonce);
            // console.log(`Roll ${i} - Public Hash:`, publicHash);
            // console.log(`Roll ${i} - Bitcoin Hash:`, bitcoinHash);

            expect(randomNumber).toBeGreaterThanOrEqual(1);
            expect(randomNumber).toBeLessThanOrEqual(10000000);

            const isValid = await provablyFair.verifyRoll(
                clientSeed,
                randomNumber,
                serverSeed,
                secretSalt,
                nonce,
                publicHash,
                bitcoinHash
            );
            // console.log(`O giro foi válido?`, isValid);
            expect(isValid).toBe(true);
        }
    });
});
