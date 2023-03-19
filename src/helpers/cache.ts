import { StaticJsonRpcProvider } from '@ethersproject/providers';

const blocks = {};

const providers = {};

export function getProvider(network: string): StaticJsonRpcProvider {
  if (!providers[network])
    providers[network] = new StaticJsonRpcProvider(`https://rpc.brovider.xyz/${network}`);

  return providers[network];
}

export async function getBlock(network: string, blockNum: number) {
  const provider = getProvider(network);
  const block = await provider.getBlock(blockNum);

  if (!blocks[network]) blocks[network] = {};
  blocks[network][`_${block.timestamp}`] = block.number;

  return {
    number: block.number,
    timestamp: block.timestamp
  };
}

export async function getRange(network: string, ts: number) {
  const provider = getProvider(network);
  let from: any = false;
  let to: any = false;

  if (blocks[network]) {
    Object.entries(blocks[network])
      .map(([blockTs, blockNum]: any[]) => [parseInt(blockTs.slice(1)), blockNum])
      .sort((a, b) => a[0] - b[0])
      .forEach(([blockTs, blockNum]: number[]) => {
        if (blockTs >= ts && !to) to = { timestamp: blockTs, number: blockNum };
        if (blockTs <= ts) from = { timestamp: blockTs, number: blockNum };
      });
  }

  if (from && to) return [from, to];

  return await Promise.all([provider.getBlock(1), provider.getBlock('latest')]);
}
