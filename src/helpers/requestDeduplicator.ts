import { createHash } from 'crypto';
import { requestDeduplicatorSize } from './metrics';

function sha256(str: string) {
  return createHash('sha256').update(str).digest('hex');
}

const ongoingRequests = new Map();

export default function serve(id, action, args) {
  const key = sha256(id);
  if (!ongoingRequests.has(key)) {
    const requestPromise = action(...args)
      .then(result => result)
      .catch(e => {
        console.log('[requestDeduplicator] request error', e);
        throw e;
      })
      .finally(() => {
        ongoingRequests.delete(key);
      });
    ongoingRequests.set(key, requestPromise);
  }

  requestDeduplicatorSize.set(ongoingRequests.size);
  return ongoingRequests.get(key);
}
