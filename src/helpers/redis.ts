import { createClient } from 'redis';

let client;

(async () => {
  client = createClient({ url: process.env.DATABASE_URL });
  client.on('connect', () => console.log('[redis] Redis connect'));
  client.on('ready', () => console.log('[redis] Redis ready'));
  client.on('reconnecting', err => console.log('[redis] Redis reconnecting', err));
  client.on('error', err => console.log('[redis] Redis error', err));
  client.on('end', err => console.log('[redis] Redis end', err));
  await client.connect();
  setInterval(async () => {
    const ts = (Date.now() / 1e3).toFixed();
    try {
      await client.set('heartbeat', ts);
      const heartbeat = await client.get('heartbeat');
      console.log('[redis] Heartbeat', heartbeat);
    } catch (e) {
      console.log('[redis] Heartbeat failed', e);
    }
  }, 10e3);
})();

export default client;
