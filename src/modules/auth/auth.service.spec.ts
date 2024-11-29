import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { User } from 'src/dal/user-repo/user.schema';
import { isDomainWhiteListed } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getModelToken(User.name),
          useValue: Model, // <-- Use the Model Class from Mongoose
        },
        AuthService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('check key not present', () => {
    const isKey = isDomainWhiteListed('https://nfts.shyft.to', [
      'abc.to',
      'http://shyft.to',
    ]);
    expect(isKey).toBeFalsy();
  });

  it('check key is present', () => {
    const isKey = isDomainWhiteListed('https://nfts.shyft.to', [
      'https://nfts.shyft.to',
      'http://shyft.to',
    ]);
    expect(isKey).toBeTruthy();
  });
});
