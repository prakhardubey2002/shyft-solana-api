import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from 'eventemitter2';
import { AccountService } from 'src/modules/account/account.service';
import { UpdateNftService } from './update-nft.service';

describe('UpdateNftService', () => {
  let service: UpdateNftService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UpdateNftService, AccountService, EventEmitter2],
    }).compile();

    service = module.get<UpdateNftService>(UpdateNftService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
