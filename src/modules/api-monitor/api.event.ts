export class ApiInvokeEvent {
  constructor(apiEndpoint: string, apiKey: string) {
    this.apiKey = apiKey;
    this.endpoint = apiEndpoint;
  }

  endpoint: string;
  apiKey: string;
}
