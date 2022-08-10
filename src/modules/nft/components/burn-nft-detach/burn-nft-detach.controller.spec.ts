import { Test, TestingModule } from '@nestjs/testing';
import { BurnNftDetachController } from './burn-nft-detach.controller';

describe('BurnNftDetachController', () => {
  let controller: BurnNftDetachController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BurnNftDetachController],
    }).compile();

    controller = module.get<BurnNftDetachController>(BurnNftDetachController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
