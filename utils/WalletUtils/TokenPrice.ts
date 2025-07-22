import { useEffect, useState } from "react";

export function usePriceData() {
  const [ethPriceUsd, setEthPriceUsd] = useState<number>(0);

  const fetchEthPrice = async (): Promise<number> => {
    try {
      // Using CoinGecko API (free, no API key required)
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      const data = await response.json();
      const price = data.ethereum.usd;
      setEthPriceUsd(price);
      return price;
    } catch (error) {
      console.error("Failed to fetch ETH price:", error);
      return 0;
    }
  };

  const fetchTokenPrices = async (
    symbols: string[]
  ): Promise<Record<string, number>> => {
    if (symbols.length === 0) return {};

    try {
      // Using CoinGecko API to fetch multiple token prices
      // Note: CoinGecko uses coin IDs, not symbols, so we'll try a symbol-based approach
      const symbolsQuery = symbols.join(",").toLowerCase();

      // Alternative: Use CryptoCompare API (free, no API key required)
      const response = await fetch(
        `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbolsQuery}&tsyms=USD`
      );
      const data = await response.json();

      const result: Record<string, number> = {};
      symbols.forEach((symbol) => {
        const upperSymbol = symbol.toUpperCase();
        result[symbol] = data[upperSymbol]?.USD || 0;
      });

      return result;
    } catch (error) {
      console.error("Failed to fetch token prices:", error);
      // Fallback: return 0 for all symbols
      const fallback: Record<string, number> = {};
      symbols.forEach((symbol) => {
        fallback[symbol] = 0;
      });
      return fallback;
    }
  };

  useEffect(() => {
    fetchEthPrice();
  }, []);

  return { ethPriceUsd, fetchEthPrice, fetchTokenPrices };
}
