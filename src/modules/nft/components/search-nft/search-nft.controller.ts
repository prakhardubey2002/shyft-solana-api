import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { Controller, Get, Query, Req, Version } from '@nestjs/common';
import { SearchNftService } from './search-nft.service';
import { SearchAttributesOpenApi } from './open-api';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiInvokeEvent } from 'src/modules/api-monitor/api.event';

@ApiTags('NFT')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('nft')
export class SearchNftcontroller {
	constructor(
		private searchNftService: SearchNftService,
		private eventEmitter: EventEmitter2
	) { }

	@SearchAttributesOpenApi()
	@Get('search/attributes')
	@Version('1')
	async searchNft(
		@Query() query,
		@Req() request: any
	): Promise<any> {
		const result = await this.searchNftService.searchNftsByAttributes(query, request.id)

		const nftCreationEvent = new ApiInvokeEvent('nft.search', request.apiKey);
		this.eventEmitter.emit('api.invoked', nftCreationEvent);

		return {
			success: true,
			message: "filtered NFTs",
			result: result,
		}
	}
}