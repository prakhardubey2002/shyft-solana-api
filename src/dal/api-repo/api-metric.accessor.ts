import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiMetric, ApiMetricDocument } from './api-metric.schema';

@Injectable()
export class ApiMetricAccessor {
  constructor(
    @InjectModel(ApiMetric.name)
    public ApiMetricModel: Model<ApiMetricDocument>,
  ) {}

  public async insert(data: ApiMetric): Promise<any> {
    const result = await this.ApiMetricModel.create(data);
    return result;
  }
}
