import { Test, TestingModule } from '@nestjs/testing';
import { MintNftController } from './mint-nft.controller';

describe('MintNftController', () => {
  let controller: MintNftController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MintNftController],
    }).compile();

    controller = module.get<MintNftController>(MintNftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
