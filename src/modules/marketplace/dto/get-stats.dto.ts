import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString, MaxDate, MinDate } from 'class-validator';
import { configuration } from 'src/common/configs/config';

const { minDateOnSearch } = configuration();

export class GetStatsDto {
	@ApiProperty({
		title: 'network',
		type: String,
		enum: WalletAdapterNetwork,
		description: 'Select network',
	})
	@IsNotEmpty()
	readonly network: WalletAdapterNetwork;

  @ApiProperty({
		title: 'Marketplace Address',
		type: String,
		description: 'address of the Marketplace in which the NFT is being sold',
		example: '54K5BTMj8ynktzEeaD1iGhAJsCN2svBKmD1fTQTonbBB',
	})
	@IsNotEmpty()
	@IsString()
	readonly marketplace_address: string;

  @ApiPropertyOptional({
		title: 'start_date',
		type: Date,
		description: 'YYYY-MM-DD format',
		example: '2022-09-02',
	})
	@IsOptional()
  @IsDate()
	@MinDate(new Date(minDateOnSearch))
	@MaxDate(new Date())
  @Transform(({ value }) => {
		if (new Date(value) < new Date(minDateOnSearch)) {
			return new Date(minDateOnSearch);
		}
		return new Date(value);
	})
	readonly start_date: Date;

  @ApiPropertyOptional({
		title: 'end_date',
		type: Date,
		description: 'YYYY-MM-DD format',
		example: '2022-09-06',
	})
  @IsOptional()
  @IsDate()
	@MinDate(new Date(minDateOnSearch))
	@MaxDate(new Date())
  @Transform(({ value }) => {
		if (new Date(value) < new Date(minDateOnSearch)) {
			return new Date(minDateOnSearch);
		}
		return new Date(value);
	})
	readonly end_date?: Date;
}