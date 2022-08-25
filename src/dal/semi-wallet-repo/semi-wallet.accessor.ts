import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { SemiCustodialWallet, SemiWalletDocument } from './semi-wallet.schema';

@Injectable()
export class SemiWalletAccessor {
  constructor(
    @InjectModel(SemiCustodialWallet.name)
    public SemiWalletModel: Model<SemiWalletDocument>,
  ) {}

  public async insert(data: SemiCustodialWallet): Promise<SemiCustodialWallet> {
    const result = await this.SemiWalletModel.create(data);
    return result;
  }

  public async fetch(filter: object): Promise<SemiCustodialWallet> {
    const result = await this.SemiWalletModel.findOne(filter);
    return result;
  }

  public async fetchAll(id: ObjectId): Promise<SemiCustodialWallet[]> {
    const result = await this.SemiWalletModel.find({
      api_key_id: id,
    });
    return result;
  }
}
