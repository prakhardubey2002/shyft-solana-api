import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) public userModel: Model<UserDocument>) {}

  public async validateUser(apiKey: string): Promise<any> {
    const user = await this.userModel.findOne({ apiKey });
    // console.log(user);
    if (user) {
      return user.email;
    }
    return null;
  }
}
