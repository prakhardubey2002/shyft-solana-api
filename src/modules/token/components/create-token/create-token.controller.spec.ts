import { Test, TestingModule } from '@nestjs/testing';
import { CreateTokenController } from './create-token.controller';

describe('CreateTokenController', () => {
  let controller: CreateTokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateTokenController],
    }).compile();

    controller = module.get<CreateTokenController>(CreateTokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
