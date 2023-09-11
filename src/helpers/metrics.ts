import init, { client } from '@snapshot-labs/snapshot-metrics';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { Express } from 'express';

export default function initMetrics(app: Express) {
  init(app, {
    whitelistedPath: [/^\/$/]
  });
}

const networksCount = new client.Gauge({
  name: 'networks_count',
  help: 'Number of networks.'
});
networksCount.set(Object.keys(networks).length);
