import { Keypair, PublicKey } from '@solana/web3.js';
import * as base58 from 'bs58';
import * as pandoraBox from './pandora-box';

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

  async getKeypair(password: string, params: pandoraBox.EncryptParams) {
    //Try to decrypt data with the password
    try {
      const keypair = this.keys.unlock(password, params);
      return keypair;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
