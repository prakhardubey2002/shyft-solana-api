import { Test, TestingModule } from '@nestjs/testing';
import { BurnNftDetachService } from './burn-nft-detach.service';

describe('BurnNftDetachService', () => {
  let service: BurnNftDetachService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BurnNftDetachService],
    }).compile();

    service = module.get<BurnNftDetachService>(BurnNftDetachService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
