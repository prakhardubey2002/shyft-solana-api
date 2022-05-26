import { Test, TestingModule } from '@nestjs/testing';
import { CreateNftController } from './create-nft.controller';

describe('CreateNftController', () => {
  let controller: CreateNftController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateNftController],
    }).compile();

    controller = module.get<CreateNftController>(CreateNftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
