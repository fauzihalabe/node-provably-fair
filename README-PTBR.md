# Gerador de Números Aleatórios Provavelmente Justo

Um sistema provavelmente justo para gerar e verificar números aleatórios com base em dados da blockchain. Ideal para aplicações onde a justiça, transparência e verificabilidade são essenciais, como em jogos e loterias.

## Instalação

Você pode instalar este pacote usando npm:

```
npm install node-provably-fair
```

ou usando yarn:

```
yarn add node-provably-fair
```

## Como Funciona

Este pacote gera números aleatórios verificáveis combinando dados da blockchain (hashes de blocos do Bitcoin) com seeds e salts fornecidos tanto pelo servidor quanto pelo cliente. Isso garante que os resultados sejam à prova de manipulação e transparentes.

### Por Que Usar Provably Fair?

- **Transparência**: Todos os números aleatórios gerados podem ser verificados pelo cliente, pois são baseados em dados públicos da blockchain e seeds criptográficos.
- **Segurança**: Ao usar seeds fornecidos pelo cliente junto com salts e seeds gerados pelo servidor, o sistema garante que os resultados não possam ser manipulados.
- **Justiça**: Os números são gerados usando uma combinação de hashes de blocos do Bitcoin, seeds do cliente e do servidor, tornando-os comprovadamente aleatórios e imparciais.
- **Cache**: Implementação de cache para requisições de hash de bloco do Bitcoin para melhorar o desempenho.
- **Opções Configuráveis**: Opções de configuração para cache, timeouts e comprimentos de seed.
- **Tratamento de Erros**: Tratamento de erros aprimorado para problemas de rede e respostas inválidas.
- **Desempenho**: Uso de `undici` para requisições HTTP mais rápidas.

---

### 1. Importar e Inicializar

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

#### Opções de Configuração

- **useCache**: (boolean, padrão: true) Se deve usar cache para requisições de hash de bloco do Bitcoin.
- **cacheTTL**: (number, padrão: 60000) Tempo de vida para valores em cache em milissegundos.
- **fetchTimeout**: (number, padrão: 5000) Timeout para requisições fetch em milissegundos.
- **serverSeedLength**: (number, padrão: 32) Comprimento do seed do servidor em bytes.
- **secretSaltLength**: (number, padrão: 4) Comprimento do salt secreto em bytes.

### 2. Gerar Números Aleatórios Provavelmente Justos

Esta função gera um número aleatório provavelmente justo usando dados da blockchain.

#### `generateProvably(clientSeed, max?)`

- **clientSeed**: _(obrigatório)_ Um seed fornecido pelo cliente para garantir sua participação no processo de geração.
- **max**: _(opcional, padrão: 10.000.000)_ O valor máximo para o número gerado.

#### Exemplo:

```typescript
try {
  const result = await provablyFair.generateProvably("clientSeed123");
  console.log(result);
} catch (error) {
  console.error("Erro ao gerar número aleatório:", error.message);
}
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

### 3. Verificar um Giro

Esta função permite que você verifique se um número aleatório gerado é justo comparando os valores usados para gerá-lo.

#### `verifyRoll(clientSeed, roll, serverSeed, secretSalt, nonce, publicHash, bitcoinHash)`

#### Exemplo:

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

console.log(isValid); // true ou false
```

### 4. Obter Intervalo de Vitória

Esta função retorna um intervalo de vitória com base em uma porcentagem fornecida.

#### `getWinInterval(percentage, totalRange?)`

- **percentage**: _(obrigatório)_ A porcentagem de vitória desejada.
- **totalRange**: _(opcional, padrão: 10.000.000)_ O total de possibilidades.

#### Exemplo:

```typescript
const winInterval = provablyFair.getWinInterval(15); // 15% de chance de vitória
console.log(winInterval);
```

#### Resposta:

```typescript
{
  percentage: 15,
  interval: [1500001, 3000000]
}
```

### 5. Obter Múltiplos Intervalos de Vitória

Esta função retorna um array de intervalos de vitória para múltiplas porcentagens.

#### `getWinIntervals(percentages, totalRange?)`

- **percentages**: _(obrigatório)_ Um array de porcentagens.
- **totalRange**: _(opcional, padrão: 10.000.000)_ O total de possibilidades.

#### Exemplo:

```typescript
const winIntervals = provablyFair.getWinIntervals([20, 20, 20, 20, 20]);
console.log(winIntervals);
```

#### Resposta:

```typescript
[
  { percentage: 20, interval: [1, 2000000] },
  { percentage: 20, interval: [2000001, 4000000] },
  { percentage: 20, interval: [4000001, 6000000] },
  { percentage: 20, interval: [6000001, 8000000] },
  { percentage: 20, interval: [8000001, 10000000] },
];
```

### 6. Rotacionar Seeds

Esta função gera novos seeds do servidor e salts, redefinindo o nonce para zero.

#### `rotateSeeds()`

#### Exemplo:

```typescript
provablyFair.rotateSeeds();
```

### 7. Getters para Dados Públicos

Você pode recuperar o hash público, nonce ou outros dados importantes usando getters.

#### `getPublicHash()`

- Retorna o hash público atual gerado a partir do seed do servidor e do salt secreto.

#### Exemplo:

```typescript
const publicHash = provablyFair.getPublicHash();
console.log(publicHash);
```

#### `getNonce()`

- Retorna o nonce atual utilizado.

#### Exemplo:

```typescript
const nonce = provablyFair.getNonce();
console.log(nonce);
```

### 8. Calcular Probabilidade de Vitória

Esta função calcula a probabilidade de vitória com base em um intervalo de vitória e o total de possibilidades.

#### `calculateWinProbability(winRange, totalRange?)`

- **winRange**: _(obrigatório)_ O tamanho do intervalo de vitória.
- **totalRange**: _(opcional, padrão: 10.000.000)_ O total de possibilidades.

#### Exemplo:

```typescript
const probability = provablyFair.calculateWinProbability(1000000); // 1.000.000 de 10.000.000
console.log(probability); // 10%
```

---

## Tratamento de Erros

A classe ProvablyFair agora inclui tratamento de erros aprimorado. Ao usar o método `generateProvably`, é recomendado usar blocos try-catch para lidar com possíveis erros:

```typescript
try {
  const result = await provablyFair.generateProvably("clientSeed123");
  // Processar o resultado
} catch (error) {
  if (error instanceof Error) {
    console.error("Erro ao gerar número aleatório:", error.message);
    // Lidar com casos de erro específicos, se necessário
  }
}
```

---

## Licença

Este pacote está licenciado sob a [Licença MIT](LICENSE).

---

## Conclusão

Com **Provably Fair**, você garante que números aleatórios são gerados de forma segura e transparente, ideal para aplicações onde confiança e justiça são fundamentais, como em jogos e apostas.

Fique à vontade para contribuir ou relatar qualquer problema no [repositório GitHub](https://github.com/fauzihalabe/node-provably-fair).
