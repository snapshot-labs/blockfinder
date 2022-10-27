import { tsToBlockWithApi, tsToBlockWithNode } from '../../src/graphql/blocks';

jest.mock('../../src/redis.ts', () => jest.fn());

describe('block number', () => {
  const timestamp = 1666865075;
  describe('on Ethereum Mainnet', () => {
    it('should be the same when fetched from explorer API and from Node', async () => {
      const blockWithApi = await tsToBlockWithApi('1', timestamp);
      const blockWithNode = await tsToBlockWithNode('1', timestamp);

      expect(blockWithApi).toBe(15838700);
      expect(blockWithNode).toBe(15838700);
    }, 10000);
  });

  describe('on Polygon Mainnet', () => {
    it('should be the same when fetched from explorer API and from Node', async () => {
      const blockWithApi = await tsToBlockWithApi('137', timestamp);
      const blockWithNode = await tsToBlockWithNode('137', timestamp);

      expect(blockWithApi).toBe(34858621);
      expect(blockWithNode).toBe(34858621);
    }, 10000);
  });
});
