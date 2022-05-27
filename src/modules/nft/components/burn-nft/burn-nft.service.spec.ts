import { Test, TestingModule } from '@nestjs/testing';
import { BurnNftService } from './burn-nft.service';

describe('BurnNftService', () => {
  let service: BurnNftService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BurnNftService],
    }).compile();

    service = module.get<BurnNftService>(BurnNftService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
