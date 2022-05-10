import { Signer, TezosToolkit } from '@taquito/taquito'
import {
  b58cencode,
  hex2buf,
  mergebuf,
  prefix,
  validateAddress,
  ValidationResult,
} from '@taquito/utils'
import assert, { doesNotReject, match, rejects, strictEqual } from 'assert'

import TezosKmsClient from './tezos-kms-client'

const INVALID_KEY_ID = 'mrk-deadbeefdeadbeefdeadbeefdeadbeef'

class TezosKmsSigner implements Signer {
  constructor(private client: TezosKmsClient) {}

  async sign(
    op: string,
    magicByte?: Uint8Array,
  ): Promise<{
    bytes: string
    sig: string
    prefixSig: string
    sbytes: string
  }> {
    let bb = hex2buf(op)
    if (typeof magicByte !== 'undefined') {
      bb = mergebuf(magicByte, bb)
    }
    const bytesBuffer = Buffer.from(bb)

    const rawSignature = await this.client.signOperation(bytesBuffer)

    return {
      bytes: op,
      sig: b58cencode(rawSignature, prefix.sig),
      prefixSig: b58cencode(rawSignature, prefix.spsig),
      sbytes: `${op}${rawSignature.toString('hex')}`,
    }
  }

  async publicKey() {
    return this.client.getPublicKey()
  }

  async publicKeyHash() {
    return this.client.getPublicKeyHash()
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async secretKey(): Promise<string> {
    throw new Error('Private key cannot be exposed')
  }
}

describe('TezosKmsClient', function () {
  let validKeyClient: TezosKmsClient
  let invalidKeyClient: TezosKmsClient

  before(function () {
    validKeyClient = new TezosKmsClient(
      process.env.KMS_KEY_ID ?? '',
      process.env.AWS_REGION ?? '',
    )
    invalidKeyClient = new TezosKmsClient(
      INVALID_KEY_ID,
      process.env.AWS_REGION ?? '',
    )
  })

  describe('getPublicKey', function () {
    it('should return a valid public key if key ID is valid', async function () {
      const publicKey = await validKeyClient.getPublicKey()
      match(publicKey, /sppk[a-zA-Z0-9]{51}/g)
    })

    it('should throw an error if key ID is invalid', async function () {
      await rejects(invalidKeyClient.getPublicKey())
    })
  })

  describe('getPublicKeyHash', function () {
    it('should return a valid PKH if key ID is valid', async function () {
      const pkh = await validKeyClient.getPublicKeyHash()
      strictEqual(validateAddress(pkh), ValidationResult.VALID)
      assert(pkh.startsWith('tz2'))
    })

    it('should throw an error if key ID is invalid', async function () {
      await rejects(invalidKeyClient.getPublicKeyHash())
    })
  })

  it('should enable signing and sending TEZ transfer', async function () {
    const tezos = new TezosToolkit(
      process.env.RPC_URL ?? 'http://localhost:20000',
    )
    tezos.setSignerProvider(new TezosKmsSigner(validKeyClient))
    await doesNotReject(
      tezos.contract.transfer({
        amount: 1,
        mutez: true,
        to:
          process.env.SEND_TEZ_DESTINATION ??
          'tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU',
      }),
    )
  }).timeout(60_000)
})
