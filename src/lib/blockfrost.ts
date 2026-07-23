const network  = (process.env.CARDANO_NETWORK ?? 'preprod').toLowerCase();
const BASE_URL = `https://cardano-${network}.blockfrost.io/api/v0`;
const PROJECT_ID = process.env.BLOCKFROST_PROJECT_ID ?? '';

async function bfFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: { project_id: PROJECT_ID, 'Content-Type': 'application/json', ...(opts?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`Blockfrost ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function getProtocolParams() {
  return bfFetch('/epochs/latest/parameters');
}

export interface BfUtxo {
  tx_hash:  string;
  tx_index: number;
  amount:   Array<{ unit: string; quantity: string }>;
}

export async function getUtxos(address: string): Promise<BfUtxo[]> {
  return bfFetch(`/addresses/${address}/utxos`);
}

export async function getAddressDetails(address: string) {
  return bfFetch(`/addresses/${address}`);
}

export async function submitTx(cborHex: string): Promise<string> {
  const body = Buffer.from(cborHex, 'hex');
  const res = await fetch(`${BASE_URL}/tx/submit`, {
    method: 'POST',
    headers: { project_id: PROJECT_ID, 'Content-Type': 'application/cbor' },
    body,
  });
  if (!res.ok) throw new Error(`Blockfrost tx/submit: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function getTxStatus(txHash: string) {
  return bfFetch(`/txs/${txHash}`);
}
