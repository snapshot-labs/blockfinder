import snapshotConfig from '@snapshot-labs/eslint-config';

export default [...snapshotConfig, { ignores: ['build/**', 'node_modules/**'] }];
