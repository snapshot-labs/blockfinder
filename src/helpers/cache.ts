import { capture } from '@snapshot-labs/snapshot-sentry';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { Block, getBlockNumber } from './utils';

const starts: Record<string, number> = {};
Object.keys(networks).forEach(network => {
  starts[network] = networks[network].start || 1;
});

const blocks: Record<string, Record<string, number>> = {};

export async function getBlock(
  network: string,
  blockNum: number
): Promise<Block> {
  const block = await getBlockNumber(network, blockNum);

  if (block?.timestamp) {
    if (!blocks[network]) blocks[network] = {};
    blocks[network][`_${block.timestamp}`] = block.number;

    return block;
  }

  const e = new Error('Invalid block response');
  capture(e, { block: JSON.stringify(block) });
  return Promise.reject(e);
}

export async function getRange(
  network: string,
  ts: number
): Promise<[Block, Block]> {
  let from: Block | null = null;
  let to: Block | null = null;

  if (blocks[network]) {
    // console.time('getRange');

    Object.entries(blocks[network])
      .map(([blockTs, blockNum]) => [parseInt(blockTs.slice(1)), blockNum])
      .sort((a, b) => a[0] - b[0])
      .forEach(([blockTs, blockNum]) => {
        if (blockTs >= ts && !to) to = { timestamp: blockTs, number: blockNum };
        if (blockTs <= ts) from = { timestamp: blockTs, number: blockNum };
      });

    // console.timeEnd('getRange');
  }

  if (from && to) return [from, to];

  return await Promise.all([
    getBlockNumber(network, starts[network]),
    getBlockNumber(network, 'latest')
  ]);
}
