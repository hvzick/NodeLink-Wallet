import { Alchemy } from "alchemy-sdk";

export interface TokenBalance {
  contractAddress: string;
  tokenBalance: string;
  tokenSymbol?: string;
  tokenName?: string;
  tokenDecimals?: number;
  logo?: string;
  balanceUsd?: number;
  priceUsd?: number;
}

export class TokenService {
  private alchemy: Alchemy;

  constructor(alchemy: Alchemy) {
    this.alchemy = alchemy;
  }

  /**
   * Fetch real token balances from the blockchain
   */
  async fetchTokenBalances(address: string): Promise<TokenBalance[]> {
    try {
      console.log(`Fetching token balances for address: ${address}`);

      // Get token balances using Alchemy
      const balances = await this.alchemy.core.getTokenBalances(address);

      const processedTokens: TokenBalance[] = [];

      console.log(`Found ${balances.tokenBalances.length} potential tokens`);

      for (const tokenBalance of balances.tokenBalances) {
        if (!tokenBalance.tokenBalance || tokenBalance.tokenBalance === "0x0") {
          continue;
        }

        try {
          // Get token metadata
          const metadata = await this.alchemy.core.getTokenMetadata(
            tokenBalance.contractAddress
          );

          const decimals = metadata.decimals || 18;
          const rawBalance = BigInt(tokenBalance.tokenBalance);
          const formattedBalance = Number(rawBalance) / Math.pow(10, decimals);

          // Skip tokens with zero balance
          if (formattedBalance === 0) continue;

          const token: TokenBalance = {
            contractAddress: tokenBalance.contractAddress,
            tokenBalance: formattedBalance.toString(),
            tokenSymbol: metadata.symbol || "UNKNOWN",
            tokenName: metadata.name || "Unknown Token",
            tokenDecimals: decimals,
            logo: metadata.logo || undefined,
          };

          processedTokens.push(token);
          console.log(
            `Added token: ${token.tokenSymbol} - ${token.tokenBalance}`
          );
        } catch (error) {
          console.log(
            `Error processing token ${tokenBalance.contractAddress}:`,
            error
          );

          // Add token with minimal info if metadata fails
          try {
            const rawBalance = BigInt(tokenBalance.tokenBalance);
            const formattedBalance = Number(rawBalance) / Math.pow(10, 18); // Default 18 decimals

            if (formattedBalance > 0) {
              const fallbackToken: TokenBalance = {
                contractAddress: tokenBalance.contractAddress,
                tokenBalance: formattedBalance.toString(),
                tokenSymbol: "UNKNOWN",
                tokenName: "Unknown Token",
                tokenDecimals: 18,
              };

              processedTokens.push(fallbackToken);
              console.log(
                `Added fallback token: ${fallbackToken.contractAddress}`
              );
            }
          } catch (innerError) {
            console.log(
              `Failed to parse token balance for ${tokenBalance.contractAddress}:`,
              innerError
            );
          }
        }
      }

      // Sort by balance (highest first)
      processedTokens.sort(
        (a, b) => parseFloat(b.tokenBalance) - parseFloat(a.tokenBalance)
      );

      console.log(`Successfully processed ${processedTokens.length} tokens`);
      return processedTokens;
    } catch (error) {
      console.error("Error fetching token balances:", error);
      return [];
    }
  }

  /**
   * Fetch token prices from external APIs
   * This is a placeholder implementation - you can integrate with CoinGecko, CoinMarketCap, etc.
   */
  async fetchTokenPrices(tokens: TokenBalance[]): Promise<TokenBalance[]> {
    try {
      // Mock price data for common tokens
      const mockPrices: Record<string, number> = {
        USDC: 1.0,
        USDT: 1.0,
        DAI: 1.0,
        WETH: 2500, // Example ETH price
        LINK: 15,
        UNI: 8,
        AAVE: 100,
        COMP: 60,
        MKR: 1500,
        SNX: 3,
        YFI: 8000,
        SUSHI: 1.5,
        "1INCH": 0.5,
        CRV: 0.8,
        BAL: 6,
        GNO: 150,
      };

      const updatedTokens = tokens.map((token) => {
        const price = mockPrices[token.tokenSymbol || ""] || 0;
        const balanceUsd =
          price > 0 ? parseFloat(token.tokenBalance) * price : undefined;

        return {
          ...token,
          priceUsd: price > 0 ? price : undefined,
          balanceUsd,
        };
      });

      console.log(`Updated ${updatedTokens.length} tokens with price data`);
      return updatedTokens;
    } catch (error) {
      console.error("Error fetching token prices:", error);
      return tokens;
    }
  }

  /**
   * Get token metadata by contract address
   */
  async getTokenMetadata(contractAddress: string) {
    try {
      return await this.alchemy.core.getTokenMetadata(contractAddress);
    } catch (error) {
      console.error(
        `Error fetching metadata for token ${contractAddress}:`,
        error
      );
      return null;
    }
  }

  /**
   * Format token balance for display
   */
  formatTokenBalance(balance: string, decimals: number = 4): string {
    const numBalance = parseFloat(balance);

    if (numBalance === 0) return "0";
    if (numBalance < 0.0001) return "< 0.0001";
    if (numBalance < 1) return numBalance.toFixed(6);
    if (numBalance < 1000) return numBalance.toFixed(decimals);
    if (numBalance < 1000000) return `${(numBalance / 1000).toFixed(2)}K`;
    return `${(numBalance / 1000000).toFixed(2)}M`;
  }

  /**
   * Format USD value for display
   */
  formatUsdValue(value?: number): string {
    if (!value || value === 0) return "";
    if (value < 0.01) return "< $0.01";
    if (value < 1000) return `$${value.toFixed(2)}`;
    if (value < 1000000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${(value / 1000000).toFixed(2)}M`;
  }
}

// Export a factory function to create TokenService instances
export const createTokenService = (alchemy: Alchemy) =>
  new TokenService(alchemy);
