import { tsToBlockWithApi, tsToBlockWithNode } from '../../src/graphql/blocks';

describe('block number', () => {
  describe('on Ethereum Mainnet', () => {
    it('should be the same when fetched from explorer API and from Node', async () => {
      const timestamp = 1665000000;
      const blockWithApi = await tsToBlockWithApi('1', timestamp);
      const blockWithNode = await tsToBlockWithNode('1', timestamp);

      expect(blockWithApi).toBe(blockWithNode);
    });
  });

  describe('on ID Chain', () => {
    it('should be the same when fetched from explorer API and from Node', async () => {
      const timestamp = 1665000000;
      const blockWithApi = await tsToBlockWithApi('74', timestamp);
      const blockWithNode = await tsToBlockWithNode('74', timestamp);

      expect(blockWithApi).toBe(blockWithNode);
    });
  });
});
