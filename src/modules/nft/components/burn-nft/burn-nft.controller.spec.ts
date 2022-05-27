import { Test, TestingModule } from '@nestjs/testing';
import { BurnNftController } from './burn-nft.controller';

describe('BurnNftController', () => {
  let controller: BurnNftController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BurnNftController],
    }).compile();

    controller = module.get<BurnNftController>(BurnNftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
