const CHANNEL = 'cityhub-proposal-updates';

export function broadcastProposalUpdate(proposalId: string): void {
  if (typeof BroadcastChannel === 'undefined') return;
  try {
    const bc = new BroadcastChannel(CHANNEL);
    bc.postMessage({ type: 'PROPOSAL_UPDATED', proposalId });
    bc.close();
  } catch {
    // not supported — polling fallback handles it
  }
}

export function broadcastProposalListChanged(): void {
  if (typeof BroadcastChannel === 'undefined') return;
  try {
    const bc = new BroadcastChannel(CHANNEL);
    bc.postMessage({ type: 'PROPOSAL_LIST_CHANGED' });
    bc.close();
  } catch {
    // not supported — polling fallback handles it
  }
}

export function listenProposalUpdates(callback: (proposalId: string | null) => void): () => void {
  if (typeof BroadcastChannel === 'undefined') return () => {};
  try {
    const bc = new BroadcastChannel(CHANNEL);
    bc.onmessage = (event) => {
      const { type, proposalId } = event.data || {};
      if (type === 'PROPOSAL_UPDATED' && proposalId) {
        callback(proposalId);
      } else if (type === 'PROPOSAL_LIST_CHANGED') {
        callback(null);
      }
    };
    return () => bc.close();
  } catch {
    return () => {};
  }
}
