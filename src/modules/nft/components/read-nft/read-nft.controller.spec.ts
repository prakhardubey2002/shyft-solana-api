import { Test, TestingModule } from '@nestjs/testing';
import { ReadNftController } from './read-nft.controller';

describe('ReadNftController', () => {
  let controller: ReadNftController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReadNftController],
    }).compile();

    controller = module.get<ReadNftController>(ReadNftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
