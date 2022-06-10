import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from './auth.service';

interface IGetUserAuthInfoRequest extends Request {
  user: string; // or any other type
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
      let apiKey: string | string[] = req.headers['api_key'];

      if (!apiKey) {
        throw new UnauthorizedException();
      }
      if (Array.isArray(apiKey)) apiKey = apiKey[0];
      const email: string = await this.authService.validateUser(apiKey);
      if (!email) {
        throw new UnauthorizedException();
      }
      req.user = email;
      return true;
    } catch (e) {
      throw new HttpException(
        'You are not authorized!',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
