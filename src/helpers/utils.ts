import snapshot from '@snapshot-labs/snapshot.js';

export type Block = {
  number: number;
  timestamp: number;
};

const STARKNET_MAINNET_ID = '0x534e5f4d41494e';
const STARKNET_TESTNET_ID = '0x534e5f5345504f4c4941';
const STARKNET_NETWORKS = [STARKNET_MAINNET_ID, STARKNET_TESTNET_ID];

export async function getBlockNumber(
  network: string,
  blockNum: number | 'latest'
): Promise<Block> {
  const provider = snapshot.utils.getProvider(network);
  const result = await provider.getBlock(blockNum);

  return interpretResult(network, result);
}

function interpretResult(network: string, result: any): Block {
  if (!result) {
    throw new Error(`Invalid block response`);
  }

  if (STARKNET_NETWORKS.includes(network)) {
    return {
      number: result.block_number,
      timestamp: result.timestamp
    };
  }

  return {
    number: result.number,
    timestamp: result.timestamp
  };
}
