import snapshot from '@snapshot-labs/snapshot.js';

export type Block = {
  number: number;
  timestamp: number;
};

interface StarknetBlockResponse {
  block_number: number;
  timestamp: number;
}

interface EthereumBlockResponse {
  number: number;
  timestamp: number;
}

type BlockResponse = StarknetBlockResponse | EthereumBlockResponse;

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

function interpretResult(network: string, result: BlockResponse | null): Block {
  if (!result) {
    throw new Error(`Invalid block response for network ${network}`);
  }

  if (STARKNET_NETWORKS.includes(network)) {
    const starknetResult = result as StarknetBlockResponse;
    return {
      number: starknetResult.block_number,
      timestamp: starknetResult.timestamp
    };
  }

  const ethereumResult = result as EthereumBlockResponse;
  return {
    number: ethereumResult.number,
    timestamp: ethereumResult.timestamp
  };
}
