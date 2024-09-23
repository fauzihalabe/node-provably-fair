
# Provably Fair Random Number Generator

## English Version

A provably fair system for generating and verifying random numbers based on blockchain data. Ideal for applications where fairness, transparency, and verifiability are essential, such as in gaming and lotteries.

### Installation

You can install this package using npm:

```
npm install provably-fair
```

or using yarn:

```
yarn add provably-fair
```

### How It Works

This package generates verifiably random numbers by combining blockchain data (Bitcoin block hashes) with seeds and salts provided by both the server and client. This ensures that the results are tamper-proof and transparent.

#### Why Use Provably Fair?

- **Transparency**: All random numbers generated can be verified by the client, as they are based on public blockchain data and cryptographic seeds.
- **Security**: By using client-provided seeds along with server-generated salts and seeds, the system ensures that results cannot be manipulated.
- **Fairness**: The numbers are generated using a combination of Bitcoin block hashes, client seeds, and server seeds, making them provably random and unbiased.

### Usage

1. Import and Initialize:

```
import { ProvablyFair } from 'provably-fair';

const provablyFair = new ProvablyFair();
```

2. Generate Provably Fair Random Numbers:

This function generates a provably fair random number using blockchain data.

#### `generateProvably(clientSeed, serverSeed?, secretSalt?, max?)`

- **clientSeed**: *(required)* A seed provided by the client to ensure their involvement in the generation process.
- **serverSeed**: *(optional)* A server-generated seed. If not provided, a new secure random seed will be generated.
- **secretSalt**: *(optional)* A secret salt used to enhance security. If not provided, a new secure random salt will be generated.
- **max**: *(optional, default: 10,000,000)* The maximum value for the random number generated.

Example:

```
const result = await provablyFair.generateProvably('clientSeed123');
console.log(result);
```

Response:

- **randomNumber**: The generated random number.
- **serverSeed**: The server seed used (either provided or generated).
- **secretSalt**: The secret salt used (either provided or generated).
- **nonce**: A unique number used only once to ensure randomness.
- **clientSeed**: The client seed used.
- **publicHash**: The public hash generated from the server seed and secret salt.
- **bitcoinHash**: The hash of the latest Bitcoin block used in the generation.

### License

This package is licensed under the MIT License.

---

# Sistema de Geração de Números Aleatórios Provavelmente Justo

## Versão em Português

Um sistema provavelmente justo para gerar e verificar números aleatórios baseado em dados da blockchain. Ideal para aplicações onde a justiça, transparência e verificabilidade são essenciais, como em jogos e loterias.

### Instalação

Você pode instalar este pacote usando npm:

```
npm install provably-fair
```

ou usando yarn:

```
yarn add provably-fair
```

### Como Funciona

Este pacote gera números aleatórios verificáveis combinando dados da blockchain (hashes de blocos do Bitcoin) com seeds e salts fornecidos tanto pelo servidor quanto pelo cliente. Isso garante que os resultados sejam à prova de manipulação e transparentes.

#### Por Que Usar Provably Fair?

- **Transparência**: Todos os números aleatórios gerados podem ser verificados pelo cliente, pois são baseados em dados públicos da blockchain e seeds criptográficos.
- **Segurança**: Ao usar seeds fornecidos pelo cliente junto com salts e seeds gerados pelo servidor, o sistema garante que os resultados não possam ser manipulados.
- **Justiça**: Os números são gerados usando uma combinação de hashes de blocos do Bitcoin, seeds do cliente e do servidor, tornando-os comprovadamente aleatórios e imparciais.

### Como Usar

1. Importe e Inicialize:

```
import { ProvablyFair } from 'provably-fair';

const provablyFair = new ProvablyFair();
```

2. Gerar Números Aleatórios Provavelmente Justos:

Esta função gera um número aleatório provavelmente justo usando dados da blockchain.

#### `generateProvably(clientSeed, serverSeed?, secretSalt?, max?)`

- **clientSeed**: *(obrigatório)* Um seed fornecido pelo cliente para garantir sua participação no processo de geração.
- **serverSeed**: *(opcional)* Um seed gerado pelo servidor. Se não for fornecido, um novo seed seguro será gerado.
- **secretSalt**: *(opcional)* Um salt secreto usado para aumentar a segurança. Se não for fornecido, um novo salt seguro será gerado.
- **max**: *(opcional, padrão: 10.000.000)* O valor máximo para o número aleatório gerado.

Exemplo:

```
const result = await provablyFair.generateProvably('clientSeed123');
console.log(result);
```

Resposta:

- **randomNumber**: O número aleatório gerado.
- **serverSeed**: O seed do servidor utilizado (fornecido ou gerado).
- **secretSalt**: O salt secreto utilizado (fornecido ou gerado).
- **nonce**: Um número único usado apenas uma vez para garantir a aleatoriedade.
- **clientSeed**: O seed do cliente utilizado.
- **publicHash**: O hash público gerado a partir do seed do servidor e do salt secreto.
- **bitcoinHash**: O hash do bloco mais recente da blockchain do Bitcoin utilizado na geração.

### Licença

Este pacote está licenciado sob a Licença MIT.
