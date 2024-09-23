
# Provably Fair Random Number Generator

A provably fair system for generating and verifying random numbers based on blockchain data. Ideal for applications where fairness, transparency, and verifiability are essential, such as in gaming and lotteries.

## Installation

You can install this package using npm:

```
npm install provably-fair
```

or using yarn:

```
yarn add provably-fair
```

## How It Works

This package generates verifiably random numbers by combining blockchain data (Bitcoin block hashes) with seeds and salts provided by both the server and client. This ensures that the results are tamper-proof and transparent.

### Why Use Provably Fair?

- **Transparency**: All random numbers generated can be verified by the client, as they are based on public blockchain data and cryptographic seeds.
- **Security**: By using client-provided seeds along with server-generated salts and seeds, the system ensures that results cannot be manipulated.
- **Fairness**: The numbers are generated using a combination of Bitcoin block hashes, client seeds, and server seeds, making them provably random and unbiased.

---

## Usage

### 1. Import and Initialize

```
import { ProvablyFair } from 'node-provably-fair';

const provablyFair = new ProvablyFair();
```

### 2. Generate Provably Fair Random Numbers

This function generates a provably fair random number using blockchain data.

#### `generateProvably(clientSeed, serverSeed?, secretSalt?, max?)`

- **clientSeed**: *(required)* A seed provided by the client to ensure their involvement in the generation process.
- **serverSeed**: *(optional)* A server-generated seed. If not provided, a new secure random seed will be generated.
  - *Why use a server seed?* Providing a unique server seed for each client ensures that results are not predictable. This adds an additional layer of security.
- **secretSalt**: *(optional)* A secret salt used to enhance security. If not provided, a new secure random salt will be generated.
  - *Why use a secret salt?* Using a unique salt ensures that even if the seeds are known, the result cannot be guessed without knowing the salt.
- **max**: *(optional, default: 10,000,000)* The maximum value for the random number generated.

#### Example:

```
const result = await provablyFair.generateProvably('clientSeed123');
console.log(result);
```

#### Response:
- **randomNumber**: The generated random number.
- **serverSeed**: The server seed used (either provided or generated).
- **secretSalt**: The secret salt used (either provided or generated).
- **nonce**: A unique number used only once to ensure randomness.
- **clientSeed**: The client seed used.
- **publicHash**: The public hash generated from the server seed and secret salt.
- **bitcoinHash**: The hash of the latest Bitcoin block used in the generation.

#### Example Response:
```
{
  randomNumber: 8756223,
  serverSeed: ab12cd34...,
  secretSalt: ef56gh78...,
  nonce: 123456,
  clientSeed: clientSeed123,
  publicHash: a3b5f69...,
  bitcoinHash: 000000000000000000...
}
```

### 3. Verifying a Roll

This function allows you to verify that a generated random number is fair by comparing the values used to generate it.

#### `verifyRoll(clientSeed, roll, serverSeed, secretSalt, nonce, publicHash, bitcoinHash)`

- **clientSeed**: *(required)* The client seed used to generate the roll.
- **roll**: *(required)* The generated random number (roll) to be verified.
- **serverSeed**: *(required)* The server seed used in the original generation.
- **secretSalt**: *(required)* The secret salt used in the original generation.
- **nonce**: *(required)* The nonce used in the original generation.
- **publicHash**: *(required)* The public hash generated from the server seed and secret salt.
- **bitcoinHash**: *(required)* The Bitcoin block hash used in the original generation.

#### Example:

```
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

- **percentage**: *(required)* The desired win percentage.
- **totalRange**: *(optional, default: 10,000,000)* The total possible range.

#### Example:

```
const winInterval = provablyFair.getWinInterval(15); // 15% win rate
console.log(winInterval);
```

#### Response:
```
{
  percentage: 15,
  interval: [1500001, 3000000]
}
```

### 5. Get Multiple Win Intervals

This function returns an array of win intervals for multiple percentages.

#### `getWinIntervals(percentages, totalRange?)`

- **percentages**: *(required)* An array of percentages.
- **totalRange**: *(optional, default: 10,000,000)* The total possible range.

#### Example:

```
const winIntervals = provablyFair.getWinIntervals([10, 20, 30]);
console.log(winIntervals);
```

#### Response:
```
[
  { percentage: 10, interval: [1, 1000000] },
  { percentage: 20, interval: [1000001, 3000000] },
  { percentage: 30, interval: [3000001, 6000000] }
]
```

### 6. Rotate Seeds

This function generates new server seeds and salts, resetting the nonce to zero.

#### `rotateSeeds()`

#### Example:

```
provablyFair.rotateSeeds();
```

### 7. Getters for Public Data

You can retrieve the public hash, nonce, or other important data using getters.

#### `getPublicHash()`
- Returns the current public hash generated from the server seed and secret salt.

#### Example:

```
const publicHash = provablyFair.getPublicHash();
console.log(publicHash);
```

#### `getNonce()`
- Returns the current nonce used.

#### Example:

```
const nonce = provablyFair.getNonce();
console.log(nonce);
```

### 8. Calculate Win Probability

This function calculates the win probability based on a win range and a total range of possibilities.

#### `calculateWinProbability(winRange, totalRange?)`

- **winRange**: *(required)* The size of the win range.
- **totalRange**: *(optional, default: 10,000,000)* The total possible range.

#### Example:

```
const probability = provablyFair.calculateWinProbability(1000000); // 1,000,000 out of 10,000,000
console.log(probability); // 10%
```

---

## Advanced Usage

### Custom Server Seed and Secret Salt

To ensure maximum security, it is highly recommended to use a **custom server seed and secret salt** for each client. This prevents any potential attacks or manipulations that could arise from using the same values across multiple clients.

For example:

```
const result = await provablyFair.generateProvably(
  'clientSeed123',
  'customServerSeed123',
  'customSecretSalt123'
);
```

---

## License

This package is licensed under the [MIT License](LICENSE).

---

## Conclusion

With **Provably Fair**, you can ensure that random numbers are generated securely and transparently, making it ideal for applications where trust and fairness are critical, such as in gaming and gambling.

Feel free to contribute or raise any issues on the [GitHub repository](https://github.com/fauzihalabe/node-provably-fair).


# Gerador de Números Aleatórios Provavelmente Justo

Um sistema provavelmente justo para gerar e verificar números aleatórios com base em dados da blockchain. Ideal para aplicações onde a justiça, transparência e verificabilidade são essenciais, como em jogos e loterias.

## Instalação

Você pode instalar este pacote usando npm:

```
npm install provably-fair
```

ou usando yarn:

```
yarn add provably-fair
```

## Como Funciona

Este pacote gera números aleatórios verificáveis combinando dados da blockchain (hashes de blocos do Bitcoin) com seeds e salts fornecidos tanto pelo servidor quanto pelo cliente. Isso garante que os resultados sejam à prova de manipulação e transparentes.

### Por Que Usar Provably Fair?

- **Transparência**: Todos os números aleatórios gerados podem ser verificados pelo cliente, pois são baseados em dados públicos da blockchain e seeds criptográficos.
- **Segurança**: Ao usar seeds fornecidos pelo cliente junto com salts e seeds gerados pelo servidor, o sistema garante que os resultados não possam ser manipulados.
- **Justiça**: Os números são gerados usando uma combinação de hashes de blocos do Bitcoin, seeds do cliente e do servidor, tornando-os comprovadamente aleatórios e imparciais.

---

## Uso

### 1. Importar e Inicializar

```
import { ProvablyFair } from 'node-provably-fair';

const provablyFair = new ProvablyFair();
```

### 2. Gerar Números Aleatórios Provavelmente Justos

Esta função gera um número aleatório provavelmente justo usando dados da blockchain.

#### `generateProvably(clientSeed, serverSeed?, secretSalt?, max?)`

- **clientSeed**: *(obrigatório)* Um seed fornecido pelo cliente para garantir sua participação no processo de geração.
- **serverSeed**: *(opcional)* Um seed gerado pelo servidor. Se não for fornecido, um novo seed seguro será gerado.
  - *Por que usar um seed do servidor?* Fornecer um seed exclusivo para cada cliente garante que os resultados não sejam previsíveis. Isso adiciona uma camada adicional de segurança.
- **secretSalt**: *(opcional)* Um salt secreto usado para aumentar a segurança. Se não for fornecido, um novo salt seguro será gerado.
  - *Por que usar um salt secreto?* Usar um salt exclusivo garante que, mesmo que os seeds sejam conhecidos, o resultado não possa ser previsto sem conhecer o salt.
- **max**: *(opcional, padrão: 10.000.000)* O valor máximo para o número gerado.

#### Exemplo:

```
const result = await provablyFair.generateProvably('clientSeed123');
console.log(result);
```

#### Resposta:
- **randomNumber**: O número aleatório gerado.
- **serverSeed**: O seed do servidor utilizado (fornecido ou gerado).
- **secretSalt**: O salt secreto utilizado (fornecido ou gerado).
- **nonce**: Um número único usado uma vez para garantir a aleatoriedade.
- **clientSeed**: O seed do cliente utilizado.
- **publicHash**: O hash público gerado a partir do seed do servidor e do salt secreto.
- **bitcoinHash**: O hash do último bloco do Bitcoin utilizado na geração.

#### Exemplo de Resposta:
```
{
  randomNumber: 8756223,
  serverSeed: ab12cd34...,
  secretSalt: ef56gh78...,
  nonce: 123456,
  clientSeed: clientSeed123,
  publicHash: a3b5f69...,
  bitcoinHash: 000000000000000000...
}
```

### 3. Verificar um Giro

Esta função permite que você verifique se um número aleatório gerado é justo comparando os valores usados para gerá-lo.

#### Exemplo:

```
const isValid = provablyFair.verifyRoll(
  clientSeed,
  randomNumber,
  serverSeed,
  secretSalt,
  nonce,
  publicHash,
  bitcoinHash
);

console.log(isValid); // true ou false
```

### 4. Obter Intervalo de Vitória

Esta função retorna um intervalo de vitória com base em uma porcentagem fornecida.

#### `getWinInterval(percentage, totalRange?)`

- **percentage**: *(obrigatório)* A porcentagem de vitória desejada.
- **totalRange**: *(opcional, padrão: 10.000.000)* O total de possibilidades.

#### Exemplo:

```
const winInterval = provablyFair.getWinInterval(15); // 15% de chance de vitória
console.log(winInterval);
```

#### Resposta:
```
{
  percentage: 15,
  interval: [1500001, 3000000]
}
```

### 5. Obter Múltiplos Intervalos de Vitória

Esta função retorna um array de intervalos de vitória para múltiplas porcentagens.

#### `getWinIntervals(percentages, totalRange?)`

- **percentages**: *(obrigatório)* Um array de porcentagens.
- **totalRange**: *(opcional, padrão: 10.000.000)* O total de possibilidades.

#### Exemplo:

```
const winIntervals = provablyFair.getWinIntervals([10, 20, 30]);
console.log(winIntervals);
```

#### Resposta:
```
[
  { percentage: 10, interval: [1, 1000000] },
  { percentage: 20, interval: [1000001, 3000000] },
  { percentage: 30, interval: [3000001, 6000000] }
]
```

### 6. Rotacionar Seeds

Esta função gera novos seeds do servidor e salts, redefinindo o nonce para zero.

#### `rotateSeeds()`

#### Exemplo:

```
provablyFair.rotateSeeds();
```

### 7. Getters para Dados Públicos

Você pode recuperar o hash público, nonce ou outros dados importantes usando getters.

#### `getPublicHash()`
- Retorna o hash público atual gerado a partir do seed do servidor e do salt secreto.

#### Exemplo:

```
const publicHash = provablyFair.getPublicHash();
console.log(publicHash);
```

#### `getNonce()`
- Retorna o nonce atual utilizado.

#### Exemplo:

```
const nonce = provablyFair.getNonce();
console.log(nonce);
```

### 8. Calcular Probabilidade de Vitória

Esta função calcula a probabilidade de vitória com base em um intervalo de vitória e o total de possibilidades.

#### `calculateWinProbability(winRange, totalRange?)`

- **winRange**: *(obrigatório)* O tamanho do intervalo de vitória.
- **totalRange**: *(opcional, padrão: 10.000.000)* O total de possibilidades.

#### Exemplo:

```
const probability = provablyFair.calculateWinProbability(1000000); // 1.000.000 de 10.000.000
console.log(probability); // 10%
```

---

## Uso Avançado

### Seed do Servidor e Salt Personalizados

Para garantir máxima segurança, é altamente recomendável usar um **seed do servidor e salt personalizados** para cada cliente. Isso impede potenciais ataques ou manipulações que poderiam surgir ao usar os mesmos valores entre vários clientes.

Exemplo:

```
const result = await provablyFair.generateProvably(
  'clientSeed123',
  'customServerSeed123',
  'customSecretSalt123'
);
```

---

## Licença

Este pacote está licenciado sob a [Licença MIT](LICENSE).

---

## Conclusão

Com **Provably Fair**, você garante que números aleatórios são gerados de forma segura e transparente, ideal para aplicações onde confiança e justiça são fundamentais, como em jogos e apostas.

Fique à vontade para contribuir ou relatar qualquer problema no [repositório GitHub](https://github.com/fauzihalabe/node-provably-fair).
