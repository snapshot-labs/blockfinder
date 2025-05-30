import { getBlockNumber } from '../../../src/helpers/utils';

describe('getBlockNumber()', () => {
  it('should return an object with timestamp and block number', async () => {
    const result = await getBlockNumber('1', 'latest');

    expect(result).toEqual(
      expect.objectContaining({
        number: expect.any(Number),
        timestamp: expect.any(Number)
      })
    );
  });

  it('should handle specific block request', async () => {
    const result = await getBlockNumber('1', 22595982);
    expect(result).toEqual(
      expect.objectContaining({
        number: 22595982,
        timestamp: 1748613335
      })
    );
  });

  it('should throw error when provider getBlock fails', async () => {
    await expect(() =>
      getBlockNumber('1', 12345678912345678)
    ).rejects.toThrow();
  });

  it('should throw error on invalid network', async () => {
    await expect(getBlockNumber('invalid', 12345)).rejects.toThrow();
  });

  it('should handle different network types', async () => {
    expect(await getBlockNumber('137', 72154184)).toEqual(
      expect.objectContaining({
        number: 72154184,
        timestamp: 1748614715
      })
    );
  });

  it('should handle starknet specific block', async () => {
    expect(await getBlockNumber('0x534e5f4d41494e', 1446249)).toEqual(
      expect.objectContaining({
        number: 1446249,
        timestamp: 1748614520
      })
    );
  });

  it('should handle starknet latest block', async () => {
    expect(await getBlockNumber('0x534e5f4d41494e', 'latest')).toEqual(
      expect.objectContaining({
        number: expect.any(Number),
        timestamp: expect.any(Number)
      })
    );
  });
});
