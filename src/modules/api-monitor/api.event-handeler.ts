import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ApiMetricAccessor } from "src/dal/api-repo/api-metric.accessor";
import { ApiMetric } from "src/dal/api-repo/api-metric.schema";
import { ApiInvokeEvent } from "./api.event";

@Injectable()
export class ApiMonitorService {
	constructor(private apiMetricAccessor: ApiMetricAccessor) { }

	@OnEvent('api.invoked', { async: true })
	async handleApiInvoked(event: ApiInvokeEvent): Promise<any> {
		try {
			const metric: ApiMetric = {
				api_key: event.apiKey,
				endpoint: event.endpoint,
			}
			const result = await this.apiMetricAccessor.insert(metric)
			return result
		} catch (error) {
			throw new Error(error);
		}
	}
}