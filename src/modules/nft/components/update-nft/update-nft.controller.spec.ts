import { Test, TestingModule } from '@nestjs/testing';
import { UpdateNftController } from './update.controller';

describe('UpdateNftController', () => {
  let controller: UpdateNftController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdateNftController],
    }).compile();

    controller = module.get<UpdateNftController>(UpdateNftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
