// @ts-ignore — asm.js module, no type declarations
import * as CSL from '@emurgo/cardano-serialization-lib-asmjs';
import { getUtxos, getProtocolParams, submitTx, BfUtxo } from './blockfrost';

const TREASURY_SKEY   = () => process.env.CARDANO_TREASURY_SKEY   ?? '';
const POLICY_SKEY     = () => process.env.CARDANO_POLICY_SKEY     ?? '';
const TREASURY_ADDR   = () => process.env.CARDANO_TREASURY_ADDRESS ?? '';
const COGI_POLICY_ID  = () => process.env.COGI_POLICY_ID           ?? '';
const COGI_SCRIPT_HEX = () => process.env.COGI_NATIVE_SCRIPT_HEX  ?? '';

const COGI_TOKEN_NAME = 'COGI';
const MIN_ADA_WITH_TOKENS = '2000000';

export async function mintCogiTokens(toAddress: string, amount: number): Promise<string> {
  const [utxos, params] = await Promise.all([
    getUtxos(TREASURY_ADDR()),
    getProtocolParams(),
  ]);

  if (!utxos.length) throw new Error('Treasury wallet has no UTxOs — fund with ADA first');

  const txBuilder = buildTxBuilder(params);
  addInputs(txBuilder, utxos.slice(0, 5), TREASURY_ADDR());
  addMint(txBuilder, amount);
  addMintOutput(txBuilder, toAddress, amount);
  txBuilder.add_change_if_needed(CSL.Address.from_bech32(TREASURY_ADDR()));

  const txBody = txBuilder.build();
  const signed = signTx(txBody);
  return submitTx(Buffer.from(signed.to_bytes()).toString('hex'));
}

function buildTxBuilder(params: Record<string, unknown>) {
  const linearFee = CSL.LinearFee.new(
    CSL.BigNum.from_str(String(params.min_fee_a)),
    CSL.BigNum.from_str(String(params.min_fee_b)),
  );
  const coinsPerByte = String(params.coins_per_utxo_size ?? params.coins_per_utxo_word ?? '4310');
  const cfg = CSL.TransactionBuilderConfigBuilder.new()
    .fee_algo(linearFee)
    .coins_per_utxo_byte(CSL.BigNum.from_str(coinsPerByte))
    .pool_deposit(CSL.BigNum.from_str('500000000'))
    .key_deposit(CSL.BigNum.from_str('2000000'))
    .max_value_size(5000)
    .max_tx_size(16384)
    .build();
  return CSL.TransactionBuilder.new(cfg);
}

function addInputs(txBuilder: unknown, utxos: BfUtxo[], fromAddr: string) {
  const addr = CSL.Address.from_bech32(fromAddr);
  for (const utxo of utxos) {
    const inp = CSL.TransactionInput.new(
      CSL.TransactionHash.from_hex(utxo.tx_hash),
      utxo.tx_index,
    );
    const lovelace = utxo.amount.find(a => a.unit === 'lovelace')?.quantity ?? '0';
    (txBuilder as any).add_input(addr, inp, CSL.Value.new(CSL.BigNum.from_str(lovelace)));
  }
}

function addMint(txBuilder: unknown, amount: number) {
  const policyScript = CSL.NativeScript.from_hex(COGI_SCRIPT_HEX());
  const assetName    = CSL.AssetName.new(Buffer.from(COGI_TOKEN_NAME));
  const mintBuilder  = CSL.MintBuilder.new();
  mintBuilder.add_asset(
    CSL.MintWitness.new_native_script(CSL.NativeScriptSource.new(policyScript)),
    assetName,
    CSL.Int.new_i32(amount),
  );
  (txBuilder as any).set_mint_builder(mintBuilder);
}

function addMintOutput(txBuilder: unknown, toAddress: string, amount: number) {
  const policyHash = CSL.ScriptHash.from_hex(COGI_POLICY_ID());
  const assetName  = CSL.AssetName.new(Buffer.from(COGI_TOKEN_NAME));
  const assets     = CSL.Assets.new();
  assets.insert(assetName, CSL.BigNum.from_str(String(amount)));
  const multiAsset = CSL.MultiAsset.new();
  multiAsset.insert(policyHash, assets);

  const outValue = CSL.Value.new_with_assets(
    CSL.BigNum.from_str(MIN_ADA_WITH_TOKENS),
    multiAsset,
  );
  (txBuilder as any).add_output(
    CSL.TransactionOutput.new(CSL.Address.from_bech32(toAddress), outValue),
  );
}

function signTx(txBody: unknown) {
  const txHash    = CSL.hash_transaction(txBody);
  const vkeyWits  = CSL.Vkeywitnesses.new();

  vkeyWits.add(CSL.make_vkey_witness(txHash, CSL.PrivateKey.from_bech32(TREASURY_SKEY())));
  vkeyWits.add(CSL.make_vkey_witness(txHash, CSL.PrivateKey.from_bech32(POLICY_SKEY())));

  const witnesses     = CSL.TransactionWitnessSet.new();
  witnesses.set_vkeys(vkeyWits);

  const nativeScripts = CSL.NativeScripts.new();
  nativeScripts.add(CSL.NativeScript.from_hex(COGI_SCRIPT_HEX()));
  witnesses.set_native_scripts(nativeScripts);

  return CSL.Transaction.new(txBody, witnesses);
}
