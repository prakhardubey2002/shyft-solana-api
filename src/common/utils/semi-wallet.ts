import { Keypair, PublicKey } from '@solana/web3.js';
import * as base58 from 'bs58';
import { randomBytes } from 'tweetnacl';
import * as pandoraBox from './pandora-box';
import * as bcrypt from 'bcrypt';

export class KeyData {
  publicKey: PublicKey;
  encryptedPrivateKey: string;

  constructor(publicKey: PublicKey, privateKey) {
    this.publicKey = publicKey;
    this.encryptedPrivateKey = privateKey;
  }

  async unlock(password: string, params: pandoraBox.EncryptParams) {
    try {
      //Decode back to UInt8Array
      const encryptedData = base58.decode(this.encryptedPrivateKey);
      const secret = await pandoraBox.decryptPBKDF2(encryptedData, password, params);

      //Verify the secret, just to be sure
      const regeratedKeypair = Keypair.fromSecretKey(base58.decode(secret));

      console.log('regenerated: ', regeratedKeypair.publicKey.toBase58());
      console.log('old: ', this.publicKey.toBase58());

      return regeratedKeypair;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export class Wallet {
  keys: KeyData;

  constructor(publicKey: PublicKey, privateKey) {
    this.keys = new KeyData(publicKey, privateKey);
  }

  get publicKey() {
    return this.keys.publicKey;
  }

  static async getHash(pwd: string): Promise<string> {
    const hashedPwd = pwd
      ? await bcrypt.hash(pwd, 10)
      : randomBytes(16).toString();

    return hashedPwd;
  }

  static async create(pwd: string) {
    try {
      const keypair = Keypair.generate();
      const privatekey = base58.encode(keypair.secretKey);

      //Encrypt it
      const response = await pandoraBox.encryptPBKDF2(privatekey, pwd);
      return {
        wallet: new Wallet(
          keypair.publicKey,
          base58.encode(response.encryptedData),
        ),
        params: response.params,
      };
    } catch (error) {
      console.error(error);
    }

    return null;
  }

  async getSigningKey(password: string, params: pandoraBox.EncryptParams) {
    //Try to decrypt data with the password
    try {
      const secret = this.keys.unlock(password, params);
      return secret;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
