import init, { client } from '@snapshot-labs/snapshot-metrics';
import { capture } from '@snapshot-labs/snapshot-sentry';
import { Express } from 'express';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

export default function initMetrics(app: Express) {
  init(app, {
    whitelistedPath: [/^\/$/],
    errorHandler: (e: any) => capture(e)
  });
}

export const requestDeduplicatorSize = new client.Gauge({
  name: 'request_deduplicator_size',
  help: 'Total number of items in the deduplicator queue'
});

const networksCount = new client.Gauge({
  name: 'networks_count',
  help: 'Number of networks.'
});
networksCount.set(Object.keys(networks).length);
