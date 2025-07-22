import { useState, useCallback } from "react";

export const usePriceData = () => {
  const [ethPriceUsd, setEthPriceUsd] = useState<number>(0);

  const fetchEthPrice = useCallback(async (): Promise<number> => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      const data = await response.json();
      const price = data.ethereum?.usd || 0;
      setEthPriceUsd(price);
      return price;
    } catch (error) {
      console.error("Error fetching ETH price:", error);
      const fallbackPrice = 2000;
      setEthPriceUsd(fallbackPrice);
      return fallbackPrice;
    }
  }, []);

  const fetchTokenPrices = useCallback(
    async (contractAddresses: string[]): Promise<{ [key: string]: number }> => {
      try {
        if (contractAddresses.length === 0) return {};

        const addresses = contractAddresses.join(",");
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${addresses}&vs_currencies=usd`
        );
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching token prices:", error);
        return {};
      }
    },
    []
  );

  return {
    ethPriceUsd,
    fetchEthPrice,
    fetchTokenPrices,
  };
};
