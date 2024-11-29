import { Test, TestingModule } from '@nestjs/testing';
import { BurnTokenService } from './burn-token.service';

describe('BurnTokenService', () => {
  let service: BurnTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BurnTokenService],
    }).compile();

    service = module.get<BurnTokenService>(BurnTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
