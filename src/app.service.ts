import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { customAlphabet } from 'nanoid/async';
import { User, UserDocument } from 'src/dal/user-repo/user.schema';
import { GetApiKeyDto } from './dto/get-api-key.dto';
import { Emailer } from './common/utils/emailer';
import { WhiteListDomainsDto } from './dto/whitelist-domains.dto';
import { UserRepo } from './dal/user-repo/user-repo';
import { newProgramError, newProgramErrorFrom } from './core/program-error';

const alphabet =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
const nanoid = customAlphabet(alphabet, 16);

@Injectable()
export class AppService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private userRepo: UserRepo,
    private readonly emailer: Emailer,
  ) {}
  getHello(): string {
    return 'Welcome to explore Shyft APIs!';
  }

  async getApiKey(getApiKeyDto: GetApiKeyDto): Promise<any> {
    try {
      let api_key: string;
      let result = await this.userModel.findOne({ email: getApiKeyDto.email });
      if (!result) {
        api_key = await nanoid();
        result = await this.userModel.create({
          ...getApiKeyDto,
          api_key,
        });
      } else {
        api_key = result.api_key;
      }
      const destinationEmailAddess = result.email;
      const templateName = 'ApiKeyTemplate';
      const templateData = {
        apiKey: result.api_key,
      };
      await this.emailer.sendEmail(
        destinationEmailAddess,
        templateName,
        templateData,
      );
      return { api_key };
    } catch (error) {
      console.log(error);

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async whiteListDomain(dto: WhiteListDomainsDto): Promise<any> {
    try {
      const { api_key: apiKey } = dto;
      const whDomains = dto.getDomainList();
      const result = await this.userRepo.whilteListDomains(apiKey, whDomains);
      return {
        whitelist_domains: result,
      };
    } catch (error) {
      throw newProgramErrorFrom(error, 'whitelisting_domains_error');
    }
  }

  async deleteDomainFromWhiteList(dto: WhiteListDomainsDto): Promise<any> {
    try {
      const { api_key: apiKey } = dto;
      const rmDomains = dto.getDomainList();
      const result = await this.userRepo.removeWhiteListedDomain(
        apiKey,
        rmDomains,
      );
      return {
        whitelist_domains: result,
      };
    } catch (error) {
      throw newProgramErrorFrom(error, 'un_whitelisting_domains_error');
    }
  }
}
