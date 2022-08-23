import { AccountConstructor, AnyPublicKey } from '@metaplex-foundation/mpl-core';
import { Connection, PublicKey, AccountInfo, Commitment } from '@solana/web3.js';

export declare class Account<T = unknown> {
  readonly pubkey: PublicKey;
  readonly info: AccountInfo<Buffer>;
  data: T;
  constructor(pubkey: PublicKey, info?: AccountInfo<Buffer>);
  static from<T>(this: AccountConstructor<T>, account: Account<unknown>): T;
  static load<T>(
    this: AccountConstructor<T>,
    connection: Connection,
    pubkey: AnyPublicKey,
  ): Promise<T>;
  static isCompatible(_data: Buffer): boolean;
  static getInfo(
    connection: Connection,
    pubkey: AnyPublicKey,
  ): Promise<{
    data: Buffer;
    executable: boolean;
    owner: PublicKey;
    lamports: number;
    rentEpoch?: number;
  }>;
  static getInfos(
    connection: Connection,
    pubkeys: AnyPublicKey[],
    commitment?: Commitment,
  ): Promise<Map<AnyPublicKey, AccountInfo<Buffer>>>;
  private static getMultipleAccounts;
  assertOwner(pubkey: AnyPublicKey): boolean;
  toJSON(): {
    pubkey: string;
    info: {
      executable: boolean;
      owner: PublicKey;
      lamports: number;
      data: {
        type: 'Buffer';
        data: number[];
      };
    };
    data: T;
  };
  toString(): string;
}
