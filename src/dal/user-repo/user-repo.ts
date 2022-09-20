import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserRepo {
  constructor(@InjectModel(User.name) public UserModel: Model<UserDocument>) {}

  public async whilteListDomains(
    apiKey: string,
    domains: string[],
  ): Promise<any> {
    try {
      const filter = { api_key: apiKey };
      const doc = await this.UserModel.findOne(filter);
      if (doc == null) {
        throw new Error('api_key record does not exist');
      }
      const exisitingDomains = doc.white_listed_domains ?? [];

      for (const val of domains) {
        if (!exisitingDomains.includes(val)) {
          exisitingDomains.push(val);
        }
      }

      const update = {
        white_listed_domains: exisitingDomains,
      };
      const result = await this.UserModel.updateOne(filter, update);
      return result;
    } catch (err) {
      throw new Error(err);
    }
  }

  public async removeWhiteListedDomain(
    apiKey: string,
    domains: string[],
  ): Promise<any> {
    try {
      const filter = { api_key: apiKey };
      const doc = await this.UserModel.findOne(filter);
      if (doc == null) {
        throw new Error('api_key record does not exist');
      }

      const remainingDomains: string[] = [];
      for (const val of doc.white_listed_domains) {
        if (!domains.includes(val)) {
          remainingDomains.push(val);
        }
      }
      if (remainingDomains.length == doc.white_listed_domains.length) {
        throw new Error('domain(s) not presnet in the whilelisted domains.');
      }
      const update = {
        white_listed_domains: remainingDomains,
      };
      const result = await this.UserModel.updateOne(filter, update);
      return result;
    } catch (err) {
      throw new Error(err);
    }
  }
}
