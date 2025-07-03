import snapshot from '@snapshot-labs/snapshot.js';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

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

  if (networks[network].starknet) {
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
