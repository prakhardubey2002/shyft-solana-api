import { Test, TestingModule } from '@nestjs/testing';
import { CreateNftDetachController } from './create-nft-detach.controller';

describe('CreateNftDetachController', () => {
  let controller: CreateNftDetachController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateNftDetachController],
    }).compile();

    controller = module.get<CreateNftDetachController>(CreateNftDetachController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
