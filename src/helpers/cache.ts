import { capture } from '@snapshot-labs/snapshot-sentry';
import snapshot from '@snapshot-labs/snapshot.js';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

const starts: any = {};
Object.keys(networks).forEach(network => {
  starts[network] = networks[network].start || 1;
});

const blocks = {};

export async function getBlock(network: string, blockNum: number) {
  const provider = snapshot.utils.getProvider(network);
  const block = await provider.getBlock(blockNum);

  if (block?.timestamp) {
    if (!blocks[network]) blocks[network] = {};
    blocks[network][`_${block.timestamp}`] = block.number;

    return {
      number: block.number,
      timestamp: block.timestamp
    };
  }

  const e = new Error('Invalid block response');
  capture(e, { block: JSON.stringify(block) });
  return Promise.reject(e);
}

export async function getRange(network: string, ts: number) {
  const provider = snapshot.utils.getProvider(network);
  let from: any = false;
  let to: any = false;

  if (blocks[network]) {
    // console.time('getRange');

    Object.entries(blocks[network])
      .map(([blockTs, blockNum]: any[]) => [parseInt(blockTs.slice(1)), blockNum])
      .sort((a, b) => a[0] - b[0])
      .forEach(([blockTs, blockNum]: number[]) => {
        if (blockTs >= ts && !to) to = { timestamp: blockTs, number: blockNum };
        if (blockTs <= ts) from = { timestamp: blockTs, number: blockNum };
      });

    // console.timeEnd('getRange');
  }

  if (from && to) return [from, to];

  return await Promise.all([provider.getBlock(starts[network]), provider.getBlock('latest')]);
}
