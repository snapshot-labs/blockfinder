import { createClient } from 'redis';

let client;

(async () => {
  client = createClient({ url: process.env.DATABASE_URL });
  client.on('error', err => console.log(err));
  await client.connect();
  setInterval(() => client.get('heartbeat'), 30e3);
})();

export default client;
