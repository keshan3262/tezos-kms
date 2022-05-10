import { TezosKmsClient } from './src'

const [, , keyId, region] = process.argv

if (!keyId || !keyId.match(/mrk-[0-9a-f]{32}/g) || !region) {
  console.log(`Usage:\nnpm run get-kms-pkh <kms-key-id> <aws-region>`)
  process.exit(1)
}

const client = new TezosKmsClient(keyId, region)

client
  .getPublicKeyHash()
  .then((pkh) => console.log(`Account PKH: ${pkh}`))
  .catch(console.error)
