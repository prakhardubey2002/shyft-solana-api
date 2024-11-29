import * as bip39 from 'bip39';
import { pbkdf2 } from 'crypto';
import * as nacl from 'tweetnacl';
import * as base58 from 'bs58';

export interface EncryptParams {
  salt: string;
  kdf: string;
  digest: string;
  iterations: number;
  nonce: string;
}

export async function generateMnemonicAndSeed() {
  const mnemonic = bip39.generateMnemonic(256);
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const hexSeed = Buffer.from(seed).toString('hex');

  return { mnemonic, hexSeed };
}

async function deriveEncryptionKey(password, salt, iterations, digest) {
  return new Promise((resolve, reject) =>
    pbkdf2(
      password,
      salt,
      iterations,
      nacl.secretbox.keyLength,
      digest,
      (err, key) => (err ? reject(err) : resolve(key)),
    ),
  );
}

export async function encryptPBKDF2(
  data: string,
  password: string,
): Promise<{ encryptedData: Uint8Array; params: EncryptParams }> {
  //Encrypt it with the password and random salt
  const salt = nacl.randomBytes(16);
  const kdf = 'pbkdf2';
  const digest = 'sha256';
  const iterations = 100000;
  const key = await deriveEncryptionKey(password, salt, iterations, digest);
  if (key) {
    //Encrypt the data with the key and a random nonce
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const encryptedData = nacl.secretbox(
      Buffer.from(data),
      nonce,
      <Uint8Array>key,
    );

    return {
      encryptedData: encryptedData,
      params: {
        salt: base58.encode(salt),
        kdf,
        digest,
        iterations,
        nonce: base58.encode(nonce),
      },
    };
  }

  throw Error('Unable to derive encryption key');
}

export async function decryptPBKDF2(
  data: Uint8Array,
  password: string,
  encryptionParams: EncryptParams,
) {
  const key = await deriveEncryptionKey(
    password,
    base58.decode(encryptionParams.salt),
    encryptionParams.iterations,
    encryptionParams.digest,
  );
  const decryptedData = nacl.secretbox.open(
    data,
    base58.decode(encryptionParams.nonce),
    <Uint8Array>key,
  );
  if (!decryptedData) {
    throw Error('Incorrect password');
  }

  const plainData = Buffer.from(decryptedData).toString();

  return plainData;
}
