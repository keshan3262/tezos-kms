# Tezos KMS

## About

`tezos-kms` is a typescript library which provides functionality for using keys stored in [AWS KMS](https://aws.amazon.com/kms/) for operations in [Tezos](https://tezos.com/).

## Configuration

In order to use keys you will need to configure a key in AWS KMS. Steps 1-12 of the [Harbinger Setup Guide](https://github.com/tacoinfra/harbinger-signer#setup-instructions) provide a brief overview of how to achieve this.

## Usage

```js
import { TezosKmsClient } from '@tacoinfra/tezos-kms'

const awsKeyId = 'x' // Place your key here.
const awsRegion = 'eu-west-1'

const kmsClient = new TezosKmsClient(awsKeyId, awsRegion)

console.log(await kmsClient.getPublicKey()) // sppk...
console.log(await kmsClient.getPublicKeyHash()) // tz2...

const bytes = Buffer.from('deadbeef', 'hex')
console.log(await kmsClient.signOperation(bytes)) // <bytes>
console.log(await kmsClient.signOperationBase58(bytes)) // spsig...
```

## Integration with Taquito

An example is given in [tests](src/tezos-kms-client.spec.ts). However, `TezosKmsSigner` may be exported by this module in the future.

## Building the Library

```shell
$ npm i
$ npm run build
```

## Testing

Correct tests with, particularly, mocks for responses from AWS are a TODO. Tests can be launched now following these steps:

1. Create a .env file and add these variables:
   - `KMS_KEY_ID` - id of KMS key.
   - `AWS_REGION` - AWS region to use for getting the key.
   - `SEND_TEZ_DESTINATION` - destination of test transfer of 1 mutez.
   - `RPC_URL` - URL of RPC for the network where transfer should be made.
   - `AWS_ACCESS_KEY_ID` - access key ID of AWS account
   - `AWS_SECRET_ACCESS_KEY` - secret access key of AWS account
2. Get PKH of the account which corresponds to your KMS key using this command: `npm run get-kms-pkh <kms-key-id> <aws-region>`
3. If the balance of account is too low to pay for transfer of 1 mutez, transfer some TEZ to the account to enable it to pay.
4. Run tests with command `npm run test`

## Credits

Harbinger is written and maintained by [Luke Youngblood](https://github.com/lyoungblood) and [Keefer Taylor](https://github.com/keefertaylor).
