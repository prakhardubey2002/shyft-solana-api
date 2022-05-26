import { Test, TestingModule } from '@nestjs/testing';
import { CreateNftService } from './create-nft.service';

describe('CreateNftService', () => {
  let service: CreateNftService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateNftService],
    }).compile();

    service = module.get<CreateNftService>(CreateNftService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
