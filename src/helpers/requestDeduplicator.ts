import { createHash } from 'crypto';

function sha256(str: string) {
  return createHash('sha256').update(str).digest('hex');
}

const ongoingRequests = new Map();

export default function serve(id, action, args) {
  const key = sha256(id);
  if (!ongoingRequests.has(key)) {
    const requestPromise = action(...args)
      .then(result => {
        ongoingRequests.delete(key);
        return result;
      })
      .catch(e => {
        console.log('[requestDeduplicator] request error', e);
        ongoingRequests.delete(key);
        throw e;
      });
    ongoingRequests.set(key, requestPromise);
  }

  return ongoingRequests.get(key);
}
