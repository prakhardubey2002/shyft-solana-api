import { Test, TestingModule } from '@nestjs/testing';
import { CreateNftDetachService } from './create-nft-detach.service';

describe('CreateNftDetachService', () => {
  let service: CreateNftDetachService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateNftDetachService],
    }).compile();

    service = module.get<CreateNftDetachService>(CreateNftDetachService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
