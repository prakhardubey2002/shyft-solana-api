import { Test, TestingModule } from '@nestjs/testing';
import { UpdateNftService } from './update.service';

describe('ReadNftService', () => {
  let service: UpdateNftService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UpdateNftService],
    }).compile();

    service = module.get<UpdateNftService>(UpdateNftService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
