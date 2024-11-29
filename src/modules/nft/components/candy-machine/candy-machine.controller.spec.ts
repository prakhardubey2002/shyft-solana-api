import { Test, TestingModule } from '@nestjs/testing';
import { CandyMachineController } from './candy-machine.controller';

describe('CandyMachineController', () => {
  let controller: CandyMachineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandyMachineController],
    }).compile();

    controller = module.get<CandyMachineController>(CandyMachineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
