import { createClient } from 'redis';

let client;

(async () => {
  client = createClient({ url: process.env.DATABASE_URL });
  client.on('error', (err) => console.log(err));
  await client.connect();
  setInterval(async () => {
    const ts = (Date.now() / 1e3).toFixed();
    await client.set('heartbeat', ts);
    const heartbeat = await client.get('heartbeat');
    console.log('Heartbeat', heartbeat)
  }, 20e3);
})();

export default client;
