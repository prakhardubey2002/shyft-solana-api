import { Network } from "src/dto/netwotk.dto";

export class NftCreationEvent {
    constructor(tokenAddress: string, network: Network) {
        this.tokenAddress = tokenAddress
        this.network = network
    }

    tokenAddress: string
    network: Network;
}

export class NftReadInWalletEvent {
    constructor(walletAddress: string, network: Network) {
        this.walletAddress = walletAddress
        this.network = network
    }

    walletAddress: string
    network: Network;
}

export class NftUpdateEvent {
    constructor(tokenAddress: string) {
        this.tokenAddress = tokenAddress
    }

    tokenAddress: string
}

export class NftDeleteEvent {

}

export class NftReadEvent {
    constructor(tokenAddress: string, network: Network) {
        this.tokenAddress = tokenAddress
        this.network = network
    }

    tokenAddress: string
    network: Network;
}

