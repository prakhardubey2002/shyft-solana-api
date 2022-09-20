import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ObjectId } from 'mongoose';
import { User } from 'src/dal/user-repo/user.schema';
import { AuthService } from './auth.service';

interface IGetUserAuthInfoRequest extends Request {
  email: string; // or any other type
  apiKey: string;
  id: ObjectId;
}

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(
    public readonly reflector: Reflector,
    public readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> | never {
    try {
      const isPublic = this.reflector.get<boolean>(
        'isPublic',
        context.getHandler(),
      );

      if (isPublic) {
        return true;
      }
      const req: IGetUserAuthInfoRequest = context.switchToHttp().getRequest();
      let apiKey: string | string[] = req.headers['x-api-key'];

      if (!apiKey) {
        throw new UnauthorizedException('');
      }
      if (Array.isArray(apiKey)) apiKey = apiKey[0];
      const userData: User = await this.authService.validateUser(apiKey);
      if (!userData) {
        throw new UnauthorizedException();
      }

      isRequestFromWhitelistedDomain(userData, req);
      req.email = userData.email;
      req.id = userData.id;
      req.apiKey = userData.api_key;
      return true;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.UNAUTHORIZED);
    }
  }
}

function isRequestFromWhitelistedDomain(
  userData: User,
  req: IGetUserAuthInfoRequest,
) {
  const isCheck =
    userData?.white_listed_domains != null &&
    userData.white_listed_domains.length > 0;

  if (isCheck) {
    const origin = req.headers.origin;
    const isWhiteListed = isDomainWhiteListed(
      origin,
      userData.white_listed_domains,
    );
    if (!isWhiteListed) {
      throw new Error('Domain not whitelisted');
    }
  }
}

export function isDomainWhiteListed(
  origin: string,
  whiteListedDomains: string[],
): boolean {
  for (const v of whiteListedDomains) {
    if (v == origin) {
      return true;
    }
  }
  return false;
}
