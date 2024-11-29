import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ApiMetricAccessor } from "src/dal/api-repo/api-metric.accessor";
import { ApiMetric, ApiMetricSchema } from "src/dal/api-repo/api-metric.schema";

@Module({
	imports: [MongooseModule.forFeature([{ name: ApiMetric.name, schema: ApiMetricSchema }])],
	providers: [ApiMetricAccessor],
	exports: [ApiMetricAccessor],
})
export class ApiMonitorModule { }