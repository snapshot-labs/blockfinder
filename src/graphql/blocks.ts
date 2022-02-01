import snapshot from '@snapshot-labs/snapshot.js';
import snapshotNetworks from '@snapshot-labs/snapshot.js/src/networks.json';
import redis from '../redis';

async function tsToBlockNum(network, ts) {
  const provider = snapshot.utils.getProvider(network);
  let [from, to] = await Promise.all([
    provider.getBlock(snapshotNetworks[network]?.start || 1),
    provider.getBlock('latest')
  ]);
  if (ts > to.timestamp) return 'latest';
  if (ts < from.timestamp) return 0;

  let steps = 0;
  let range = to.number - from.number;
  while (![1, 0].includes(range)) {
    steps++;
    // console.log('From', from.number, 'to', to.number);
    // console.log('Range', range);
    // console.log('Diff', from.timestamp - ts, to.timestamp - ts);

    const blockNums: number[] = [];
    const blockTime = (to.timestamp - from.timestamp) / (to.number - from.number);
    const trialBlockNum = to.number - Math.ceil((to.timestamp - ts) / blockTime);
    // console.log('Trial', trialBlockNum);

    blockNums.push(trialBlockNum);
    let leftSpace = Math.ceil((trialBlockNum - from.number) / 2);
    let rightSpace = Math.ceil((to.number - trialBlockNum) / 2);
    Array.from(Array(6)).forEach(() => {
      blockNums.push(trialBlockNum - leftSpace);
      blockNums.push(trialBlockNum + rightSpace);
      leftSpace = Math.ceil(leftSpace / 2);
      rightSpace = Math.ceil(rightSpace / 2);
    });

    let blocks: any[] = await Promise.all(
      [...new Set(blockNums)]
        .filter(blockNum => blockNum > from.number && blockNum < to.number)
        .map(blockNum => provider.getBlock(blockNum))
    );
    blocks = [from, ...blocks, to].sort((a, b) => a.number - b.number);
    // console.log(blocks.map((block: any) => block.number));

    let newFrom = false;
    let newTo = false;
    blocks.forEach(block => {
      if (block.timestamp >= ts && !newTo) newTo = block;
      if (block.timestamp <= ts) newFrom = block;
    });
    from = newFrom;
    to = newTo;
    range = to.number - from.number;
  }

  if (range === 0) console.log('Perfect match', network, ts);
  // console.log('From', from.number, from.timestamp, 'to', to.number, to.timestamp);
  console.log('Block', to.number, 'at', to.timestamp);
  console.log('Target', ts, 'network', network, 'steps', steps);
  return to.number;
}

export default async function query(_parent, args) {
  const { where = {} } = args;
  let networks: any = where?.network_in || where?.network || '1';
  const ts: any = where?.ts || 0;
  if (!Array.isArray(networks)) networks = [networks];

  // Check cache
  // console.log('Check cache', ts, networks);
  const cache: any = await redis.hGetAll(`blocks:${ts}`);

  const p: any[] = [];
  networks.forEach(network => {
    if (cache[network]) {
      p.push(parseInt(cache[network]));
    } else {
      p.push(tsToBlockNum(network, ts));
    }
  });

  try {
    const blockNums = await Promise.all(p);
    const blockNumsObj = Object.fromEntries(
      blockNums.map((blockNum, i) => [networks[i], blockNum])
    );

    // Cache results
    const multi = redis.multi();
    Object.entries(blockNumsObj).forEach(([network, blockNum]: any) => {
      if (![0, 'error', 'latest'].includes(blockNum)) multi.hSet(`blocks:${ts}`, network, blockNum);
    });
    multi.exec();

    return Object.entries(blockNumsObj).map((block: any) => {
      return {
        network: block[0],
        number: parseInt(block[1])
      };
    });
  } catch (e) {
    console.log('Get block failed', e);
    throw new Error('server error');
  }
}
