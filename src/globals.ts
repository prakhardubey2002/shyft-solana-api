import { Strategy, TokenInfo, TokenListProvider } from "@solana/spl-token-registry";

export class Globals {

    private static solMainnetTokenList: TokenInfo[]

    static async init() {
        await Globals.setupMainetTokenList();
    }

    static getSolMainnetTokenList() {
        return Globals.solMainnetTokenList ?? [];
    }
  
    private static async setupMainetTokenList() {
        try {
            const tokens = await new TokenListProvider().resolve(Strategy.CDN);
            Globals.solMainnetTokenList = tokens.filterByClusterSlug('mainnet-beta').getList();
          } catch (error) {
            console.log('Unable to resolve sol mainnet token list: ', error); 
        }
    }
  }