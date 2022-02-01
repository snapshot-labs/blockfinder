import { createClient } from 'redis';

let client;

(async () => {
  client = createClient({ url: process.env.DATABASE_URL });
  client.on('connect', () => console.log('Redis connect'));
  client.on('ready', () => console.log('Redis ready'));
  client.on('reconnecting', (err) => console.log('Redis reconnecting', err));
  client.on('error', (err) => console.log('Redis error', err));
  client.on('end', (err) => console.log('Redis end', err));
  await client.connect();
  setInterval(async () => {
    const ts = (Date.now() / 1e3).toFixed();
    await client.set('heartbeat', ts);
    const heartbeat = await client.get('heartbeat');
    console.log('Heartbeat', heartbeat);
  }, 20e3);
})();

export default client;
