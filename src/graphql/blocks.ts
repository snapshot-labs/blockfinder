import { GraphQLError } from 'graphql';
import { capture } from '@snapshot-labs/snapshot-sentry';
import { getRange, getBlock } from '../helpers/cache';
import availableNetworks from '@snapshot-labs/snapshot.js/src/networks.json';

const validNetworkIds = Object.keys(availableNetworks);

async function tsToBlockNum(network: string, ts: number) {
  let [from, to]: any = await getRange(network, ts);
  if (ts > to.timestamp) return 'latest';
  if (ts < from.timestamp) return 0;

  // let steps = 0;
  let range = to.number - from.number;
  // console.log('From', from.number, 'to', to.number, 'range', range);

  while (range > 1) {
    // steps++;
    const blockNums: number[] = [];
    const blockTime =
      (to.timestamp - from.timestamp) / (to.number - from.number);
    const trialBlockNum =
      to.number - Math.ceil((to.timestamp - ts) / blockTime);
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
        .map(blockNum => getBlock(network, blockNum))
    );
    blocks = [from, ...blocks, to].sort((a, b) => a.number - b.number);
    // console.log(cache.map((block: any) => block.number));

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

  // if (range === 0) console.log('Perfect match', network, ts);
  // console.log('From', from.number, from.timestamp, 'to', to.number, to.timestamp);
  // console.log('Block', to.number, 'at', to.timestamp);
  // console.log('Target', ts, 'network', network, 'steps', steps);
  return to.number;
}

export default async function query(_parent, args) {
  const { where = {} } = args;
  let networks: any = where?.network_in || where?.network || '1';
  const ts: any = where?.ts || 0;
  if (!Array.isArray(networks)) networks = [networks];

  if (networks.some((network: string) => !validNetworkIds.includes(network))) {
    throw new GraphQLError('invalid network', {
      extensions: { code: 'INVALID_TIMESTAMP' }
    });
  }

  if (ts > Math.floor(Date.now() / 1000) || ts < 0) {
    throw new GraphQLError('timestamp must be in the past', {
      extensions: { code: 'INVALID_TIMESTAMP' }
    });
  }

  try {
    const blockNums = await Promise.all(
      networks.map(network => tsToBlockNum(network, ts))
    );
    const blockNumsObj = Object.fromEntries(
      blockNums.map((blockNum, i) => [networks[i], blockNum])
    );

    return Object.entries(blockNumsObj).map((block: any) => ({
      network: block[0],
      number: block[1]
    }));
  } catch (e: any) {
    if (e.status === 404) {
      throw new GraphQLError('invalid network', {
        extensions: { code: 'INVALID_NETWORK' }
      });
    }

    capture(e);
    throw new Error('server error');
  }
}
