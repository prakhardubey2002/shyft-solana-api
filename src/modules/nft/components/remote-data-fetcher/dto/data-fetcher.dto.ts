import { IsNotEmpty, IsString } from 'class-validator';
import { Network } from 'src/dto/netwotk.dto';

export class FetchAllNftDto {
    constructor(network: Network, address: string) {
        this.network = network
        this.walletAddress = address
    }

    @IsNotEmpty()
    readonly network: Network;
    @IsNotEmpty()
    @IsString()
    readonly walletAddress: string;
}


export class FetchNftDto {
    constructor(network: Network, address: string) {
        this.network = network
        this.tokenAddress = address
    }

    @IsNotEmpty()
    readonly network: Network;
    @IsNotEmpty()
    @IsString()
    readonly tokenAddress: string;
}