import { Test, TestingModule } from '@nestjs/testing';
import { BurnTokenController } from './burn-token.controller';

describe('BurnTokenController', () => {
  let controller: BurnTokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BurnTokenController],
    }).compile();

    controller = module.get<BurnTokenController>(BurnTokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
