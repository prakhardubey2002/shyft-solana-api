import { Test, TestingModule } from '@nestjs/testing';
import { ReadNftService } from './read-nft.service';

describe('ReadNftService', () => {
  let service: ReadNftService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReadNftService],
    }).compile();

    service = module.get<ReadNftService>(ReadNftService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
