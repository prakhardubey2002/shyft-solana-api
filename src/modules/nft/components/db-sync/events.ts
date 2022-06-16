export class NftCreationEvent {
    constructor(tokenAddress: string) {
        this.tokenAddress = tokenAddress
    }

    tokenAddress: string
}

export class NftReadInWalletEvent {
    constructor(walletAddress: string) {
        this.walletAddress = walletAddress
    }

    walletAddress: string
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
    constructor(tokenAddress: string) {
        this.tokenAddress = tokenAddress
    }

    tokenAddress: string
}

