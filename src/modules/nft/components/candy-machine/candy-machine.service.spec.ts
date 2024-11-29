import { Test, TestingModule } from '@nestjs/testing';
import { CandyMachineService } from './candy-machine.service';

describe('CandyMachineService', () => {
  let service: CandyMachineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CandyMachineService],
    }).compile();

    service = module.get<CandyMachineService>(CandyMachineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
