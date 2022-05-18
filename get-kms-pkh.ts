import { TezosKmsClient } from './src'

const [, , keyId, region] = process.argv

if (!keyId || !region) {
  console.log(`Usage:\nnpm run get-kms-pkh <kms-key-id> <aws-region>`)
  process.exit(1)
}

const client = new TezosKmsClient(keyId, region)

client
  .getPublicKeyHash()
  .then((pkh) => console.log(`Account PKH: ${pkh}`))
  .catch(console.error)
