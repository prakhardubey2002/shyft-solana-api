import { Test, TestingModule } from '@nestjs/testing';
import { MintNftService } from './mint-nft.service';

describe('MintNftService', () => {
  let service: MintNftService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MintNftService],
    }).compile();

    service = module.get<MintNftService>(MintNftService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
