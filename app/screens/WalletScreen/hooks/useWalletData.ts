import { useState, useCallback } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ethers } from "ethers";
import { Alchemy, AssetTransfersCategory, SortingOrder } from "alchemy-sdk";

interface TokenBalance {
  contractAddress: string;
  tokenBalance: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  logo?: string;
  priceUsd?: number;
  balanceUsd?: number;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  timeStamp: string;
  status: string;
  blockNumber: number;
}

export const useWalletData = (alchemy: Alchemy) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0.0");
  const [balanceUsd, setBalanceUsd] = useState<number>(0);
  const [networkName, setNetworkName] = useState<string>("");
  const [latestBlock, setLatestBlock] = useState<number | null>(null);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [totalPortfolioValue, setTotalPortfolioValue] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRecentTransactions = useCallback(
    async (walletAddress: string): Promise<Transaction[]> => {
      try {
        const history = await alchemy.core.getAssetTransfers({
          fromAddress: walletAddress,
          toAddress: walletAddress,
          category: [
            AssetTransfersCategory.EXTERNAL,
            AssetTransfersCategory.ERC20,
          ],
          maxCount: 10,
          order: SortingOrder.DESCENDING,
        });

        return history.transfers.map(
          (tx): Transaction => ({
            hash: tx.hash || "",
            from: tx.from || "",
            to: tx.to || "",
            value: tx.value?.toString() || "0",
            gasUsed: "0",
            gasPrice: "0",
            timeStamp: (tx as any).blockTimestamp || "",
            status: "1",
            blockNumber: parseInt(tx.blockNum || "0", 16),
          })
        );
      } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
      }
    },
    [alchemy]
  );

  const loadWalletInfo = useCallback(
    async (
      fetchEthPrice: () => Promise<number>,
      fetchTokenPrices: (
        addresses: string[]
      ) => Promise<{ [key: string]: number }>,
      onWalletRemoved: () => void
    ) => {
      try {
        const storedAddress = await AsyncStorage.getItem("walletAddress");
        if (!storedAddress) {
          onWalletRemoved();
          return;
        }
        setAddress(storedAddress);

        const [balBN, blockNum, net, tokens, currentEthPrice] =
          await Promise.all([
            alchemy.core.getBalance(storedAddress),
            alchemy.core.getBlockNumber(),
            alchemy.core.getNetwork(),
            alchemy.core.getTokenBalances(storedAddress),
            fetchEthPrice(),
          ]);

        const ethBalance = ethers.utils.formatEther(balBN);
        const ethBalanceUsd = parseFloat(ethBalance) * currentEthPrice;

        setBalance(ethBalance);
        setBalanceUsd(ethBalanceUsd);
        setLatestBlock(blockNum);
        setNetworkName(net.name);

        const validTokens = tokens.tokenBalances.filter(
          (token) => token.tokenBalance !== "0x0"
        );

        if (validTokens.length > 0) {
          const tokenAddresses = validTokens.map(
            (token) => token.contractAddress
          );
          const tokenPrices = await fetchTokenPrices(tokenAddresses);

          const tokenData = await Promise.all(
            validTokens.slice(0, 15).map(async (token) => {
              try {
                const metadata = await alchemy.core.getTokenMetadata(
                  token.contractAddress
                );
                const formattedBalance = ethers.utils.formatUnits(
                  token.tokenBalance || "0",
                  metadata.decimals || 18
                );

                const priceUsd =
                  tokenPrices[token.contractAddress.toLowerCase()] || 0;
                const balanceUsd = parseFloat(formattedBalance) * priceUsd;

                return {
                  contractAddress: token.contractAddress,
                  tokenBalance: formattedBalance,
                  tokenName: metadata.name || "Unknown Token",
                  tokenSymbol: metadata.symbol || "???",
                  tokenDecimals: metadata.decimals || 18,
                  logo: metadata.logo || undefined,
                  priceUsd,
                  balanceUsd,
                };
              } catch (error) {
                console.error(
                  `Error processing token ${token.contractAddress}:`,
                  error
                );
                return null;
              }
            })
          );

          const filteredTokenData = tokenData.filter(Boolean) as TokenBalance[];
          setTokenBalances(filteredTokenData);

          const totalTokenValue = filteredTokenData.reduce(
            (sum, token) => sum + (token.balanceUsd || 0),
            0
          );
          setTotalPortfolioValue(ethBalanceUsd + totalTokenValue);
        } else {
          setTokenBalances([]);
          setTotalPortfolioValue(ethBalanceUsd);
        }

        const transactions = await fetchRecentTransactions(storedAddress);
        setRecentTransactions(transactions);
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Error fetching wallet data:", err);
        Alert.alert(
          "Error",
          "Failed to load wallet data. Please check your internet connection."
        );
      }
    },
    [alchemy, fetchRecentTransactions]
  );

  return {
    address,
    balance,
    balanceUsd,
    networkName,
    latestBlock,
    tokenBalances,
    recentTransactions,
    totalPortfolioValue,
    lastUpdated,
    loadWalletInfo,
  };
};
