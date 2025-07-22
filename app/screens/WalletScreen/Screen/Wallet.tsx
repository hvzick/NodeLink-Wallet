/* eslint-disable @typescript-eslint/no-unused-vars */
import { ALCHEMY_API_KEY, ALCHEMY_NETWORK } from "@env";
import { Alchemy, Network } from "alchemy-sdk";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { copyToClipboard } from "../../../../utils/GlobalUtils/CopyToClipboard";
import { useThemeToggle } from "../../../../utils/GlobalUtils/ThemeProvider";
import {
  TokenBalance,
  createTokenService,
} from "../../../../utils/WalletUtils/TokenService";
import { clearWalletData } from "../../../../utils/WalletUtils/walletStorage";
import { ActionButtons } from "../components/ActionButtons";
import { BalanceCard } from "../components/BalanceCard";
import { ExportPrivateKey } from "../components/ExportPrivateKey";
import { usePriceData } from "../hooks/usePriceData";
import { useWalletData } from "../hooks/useWalletData";
import { NetworkModal } from "../modals/NetworkModal";
import { SettingsModal } from "../modals/SettingsModal";
import { TransactionsModal } from "../modals/TransactionsModal";
import ReceiveScreen from "./ReceiveScreen";
import { TransactionsPage } from "./TransactionsPage";

type SupportedNetwork = "ethereum" | "sepolia";

const ETH_LOGO =
  "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png";

interface WalletScreenProps {
  onWalletRemoved: () => void;
}

export default function WalletScreen({ onWalletRemoved }: WalletScreenProps) {
  const { currentTheme } = useThemeToggle();
  const isDarkMode = currentTheme === "dark";

  const [selectedNetwork, setSelectedNetwork] =
    useState<SupportedNetwork>("ethereum");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showNetworkModal, setShowNetworkModal] = useState<boolean>(false);
  const [showTransactionsModal, setShowTransactionsModal] =
    useState<boolean>(false);
  const [showReceiveScreen, setShowReceiveScreen] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showCopied, setShowCopied] = useState<boolean>(false);
  const [showTransactionsPage, setShowTransactionsPage] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [realTokenBalances, setRealTokenBalances] = useState<TokenBalance[]>(
    []
  );
  const [tokenLoading, setTokenLoading] = useState<boolean>(false);

  // Logo error state (per URL)
  const [logoLoadError, setLogoLoadError] = useState<{
    [url: string]: boolean;
  }>({});

  const alchemy = React.useMemo(
    () =>
      new Alchemy({
        apiKey: ALCHEMY_API_KEY,
        network: (Network as any)[ALCHEMY_NETWORK],
      }),
    []
  );

  // Create TokenService instance
  const tokenService = React.useMemo(
    () => createTokenService(alchemy),
    [alchemy]
  );

  const { ethPriceUsd, fetchEthPrice, fetchTokenPrices } = usePriceData();
  const {
    address,
    balance, // ETH/SepoliaETH balance (as Ether string)
    networkName,
    latestBlock,
    recentTransactions,
    totalPortfolioValue,
    loadWalletInfo,
  } = useWalletData(alchemy);

  // Fetch real ERC-20 token balances
  const fetchRealTokenBalances = async () => {
    if (!address) return;
    setTokenLoading(true);
    try {
      const tokens = await tokenService.fetchTokenBalances(address);
      const tokensWithPrices = await tokenService.fetchTokenPrices(tokens);
      setRealTokenBalances(tokensWithPrices);
    } catch {
      Alert.alert("Error", "Failed to fetch token balances");
    } finally {
      setTokenLoading(false);
    }
  };

  const handleCopyAddress = async () => {
    if (address) {
      await copyToClipboard(address);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const handleNetworkChange = (networkId: SupportedNetwork) => {
    setSelectedNetwork(networkId);
    setShowNetworkModal(false);
    const networkNames = {
      ethereum: "Ethereum Mainnet",
      sepolia: "Sepolia Testnet",
    };
    Alert.alert("Network Changed", `Switched to ${networkNames[networkId]}`);
  };

  const handleRemoveWallet = async () => {
    Alert.alert(
      "Remove Wallet",
      "This will remove your wallet from this device. Make sure you have backed up your private key or seed phrase!\n\nThis action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove Wallet",
          style: "destructive",
          onPress: async () => {
            try {
              await clearWalletData();
              Alert.alert(
                "Success",
                "Wallet has been removed from this device",
                [{ text: "OK", onPress: onWalletRemoved }]
              );
            } catch {
              Alert.alert("Error", "Failed to remove wallet data");
            }
          },
        },
      ]
    );
  };

  const handleViewOnEtherscan = async () => {
    if (!address) return;
    const base =
      selectedNetwork === "ethereum"
        ? "https://etherscan.io"
        : "https://sepolia.etherscan.io";
    const url = `${base}/address/${address}`;
    if (await Linking.canOpenURL(url)) {
      setShowSettingsModal(false);
      Linking.openURL(url);
    } else {
      Alert.alert("Error", "Cannot open Etherscan");
    }
  };

  const handleViewTokenOnEtherscan = (contractAddress: string) => {
    if (!contractAddress) return;
    const base =
      selectedNetwork === "ethereum"
        ? "https://etherscan.io"
        : "https://sepolia.etherscan.io";
    const url = `${base}/token/${contractAddress}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open Etherscan");
      }
    });
  };

  const handleShareAddress = () => {
    if (address) {
      setShowSettingsModal(false);
      handleCopyAddress();
    }
  };

  const handleSend = () =>
    Alert.alert("Send", "Send functionality will be implemented here");
  const handleReceive = () => setShowReceiveScreen(true);
  const handleSwap = () =>
    Alert.alert("Swap", "Swap functionality will be implemented here");

  const onNetworkChange = (networkId: string) => {
    if (networkId === "ethereum" || networkId === "sepolia") {
      handleNetworkChange(networkId as SupportedNetwork);
    } else {
      Alert.alert(
        "Unsupported network",
        "Only Ethereum and Sepolia are supported."
      );
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([
      loadWalletInfo(fetchEthPrice, fetchTokenPrices, onWalletRemoved),
      fetchRealTokenBalances(),
    ]).finally(() => {
      setLoading(false);
      setRefreshing(false);
    });
  };

  useEffect(() => {
    const initializeWallet = async () => {
      try {
        await Promise.all([
          loadWalletInfo(fetchEthPrice, fetchTokenPrices, onWalletRemoved),
          fetchRealTokenBalances(),
        ]);
      } catch (error) {
        console.error("Error initializing wallet:", error);
      } finally {
        setLoading(false);
      }
    };
    initializeWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const styles = getStyles(isDarkMode);

  // ====== Compose ETH pseudo-token and prepend ======
  const nativeEthBalance = balance ? parseFloat(balance) : 0;
  const nativeEthToken: TokenBalance = {
    contractAddress: "",
    tokenBalance: nativeEthBalance.toString(),
    tokenSymbol: selectedNetwork === "ethereum" ? "ETH" : "SepoliaETH",
    tokenName:
      selectedNetwork === "ethereum" ? "Ethereum" : "Sepolia Testnet ETH",
    tokenDecimals: 18,
    logo: ETH_LOGO,
    balanceUsd: ethPriceUsd ? nativeEthBalance * ethPriceUsd : undefined,
    priceUsd: ethPriceUsd,
  };
  const tokenList = [nativeEthToken, ...realTokenBalances];

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading wallet data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showReceiveScreen) {
    return (
      <ReceiveScreen
        address={address || ""}
        selectedNetwork={selectedNetwork}
        onBack={() => setShowReceiveScreen(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.leftHeaderSection}>
          <Text style={styles.headerTitleText}>Wallet</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.networkButton}
            onPress={() => setShowNetworkModal(true)}
          >
            <Icon
              name="language"
              size={20}
              color={isDarkMode ? "#fff" : "#000"}
            />
            <Text style={styles.networkText}>
              {selectedNetwork === "ethereum" ? "ETH" : "SEP"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowSettingsModal(true)}
          >
            <Icon
              name="settings"
              size={20}
              color={isDarkMode ? "#fff" : "#000"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollViewContainer}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Total Value */}
        <BalanceCard
          totalPortfolioValue={totalPortfolioValue}
          balance={balance}
          ethPriceUsd={ethPriceUsd}
          showValue={showPortfolio}
          onToggleShow={() => setShowPortfolio((v) => !v)}
          walletAddress={address ?? ""}
          onQRPress={handleReceive}
        />

        {/* Token Holdings (ETH + ERC-20s) */}
        <>
          <Text style={styles.label}>Token Holdings</Text>
          {tokenLoading && tokenList.length === 0 ? (
            <View style={styles.tokenLoadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.tokenLoadingText}>Loading tokens...</Text>
            </View>
          ) : tokenList.length > 0 ? (
            <View style={styles.tokensContainer}>
              {tokenList.map((token, idx) => (
                <TouchableOpacity
                  key={`${token.contractAddress || "native"}-${idx}`}
                  style={styles.tokenItem}
                  onPress={
                    token.contractAddress
                      ? () => handleViewTokenOnEtherscan(token.contractAddress)
                      : undefined
                  }
                  activeOpacity={0.7}
                  disabled={!token.contractAddress}
                >
                  <View style={styles.tokenHeader}>
                    <View style={styles.tokenIconContainer}>
                      {/* Logo Failover */}
                      {token.logo && !logoLoadError[token.logo] ? (
                        <Image
                          source={{ uri: token.logo }}
                          style={styles.tokenIcon}
                          onError={() =>
                            setLogoLoadError((errs) => ({
                              ...errs,
                              [token.logo!]: true,
                            }))
                          }
                        />
                      ) : (
                        <View style={styles.tokenIconFallback}>
                          <Text style={styles.tokenIconText}>
                            {token.tokenSymbol?.charAt(0) || "?"}
                          </Text>
                        </View>
                      )}
                      <View style={styles.tokenInfo}>
                        <Text style={styles.tokenSymbol}>
                          {token.tokenSymbol || "UNKNOWN"}
                        </Text>
                        <Text style={styles.tokenName} numberOfLines={1}>
                          {token.tokenName || "Unknown Token"}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.tokenBalanceContainer}>
                      <Text style={styles.tokenBalanceValue}>
                        {tokenService.formatTokenBalance(token.tokenBalance)}
                      </Text>
                      {token.balanceUsd && token.balanceUsd > 0 && (
                        <Text style={styles.tokenBalanceUsd}>
                          {tokenService.formatUsdValue(token.balanceUsd)}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.tokenDetails}>
                    {token.priceUsd && (
                      <Text style={styles.tokenPrice}>
                        Price: $
                        {token.priceUsd.toFixed(token.priceUsd < 1 ? 6 : 2)}
                      </Text>
                    )}
                  </View>
                  {idx < tokenList.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noTokensContainer}>
              <Text style={styles.noTokensText}>No tokens found</Text>
              <Text style={styles.noTokensSubText}>
                This wallet doesn&apos;t hold any ERC-20 tokens
              </Text>
            </View>
          )}
        </>

        {/* Action Buttons */}
        <ActionButtons
          onSend={handleSend}
          onReceive={handleReceive}
          onSwap={handleSwap}
        />
      </ScrollView>

      {/* Modals */}
      <NetworkModal
        visible={showNetworkModal}
        selectedNetwork={selectedNetwork}
        onClose={() => setShowNetworkModal(false)}
        onNetworkChange={onNetworkChange}
      />
      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onRemoveWallet={handleRemoveWallet}
        onViewOnEtherscan={handleViewOnEtherscan}
        onShareAddress={handleShareAddress}
        walletAddress={address ?? undefined}
        selectedNetwork={selectedNetwork}
        onExportPrivateKey={() => {
          setShowSettingsModal(false);
          setShowExportModal(true);
        }}
        onViewTransactions={() => {
          setShowSettingsModal(false);
          setShowTransactionsPage(true);
        }}
      />
      <TransactionsModal
        visible={showTransactionsModal}
        onClose={() => setShowTransactionsModal(false)}
        transactions={recentTransactions}
        walletAddress={address ?? ""}
        selectedNetwork={selectedNetwork}
      />
      <ExportPrivateKey
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        walletAddress={address ?? undefined}
      />
      <TransactionsPage
        visible={showTransactionsPage}
        onClose={() => setShowTransactionsPage(false)}
        walletAddress={address || ""}
        alchemy={alchemy}
        selectedNetwork={selectedNetwork}
      />
    </SafeAreaView>
  );
}

const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#1C1C1D" : "#F2F2F2",
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDarkMode ? "#1C1C1D" : "#F2F2F2",
    },
    loadingText: {
      fontSize: 14,
      color: isDarkMode ? "#aaa" : "#888",
      textAlign: "center",
      marginTop: 10,
    },
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      height: 40,
      paddingHorizontal: 16,
      backgroundColor: isDarkMode ? "#1C1C1D" : "#F2F2F2",
      justifyContent: "space-between",
    },
    leftHeaderSection: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "flex-start",
    },
    headerTitleText: {
      fontSize: 25,
      fontWeight: "600",
      color: isDarkMode ? "#fff" : "#000",
    },
    headerButtons: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    networkButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 8,
      borderRadius: 12,
      backgroundColor: isDarkMode ? "#2C2C2E" : "#F0F0F0",
      gap: 6,
    },
    networkText: {
      fontSize: 12,
      fontWeight: "600",
      color: isDarkMode ? "#fff" : "#000",
    },
    settingsButton: {
      padding: 8,
      borderRadius: 12,
    },
    scrollViewContainer: {
      flex: 1,
    },
    scrollViewContent: {
      flexGrow: 1,
      paddingBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 8,
      paddingLeft: 16,
      color: isDarkMode ? "#fff" : "#333",
    },
    tokensContainer: {
      backgroundColor: isDarkMode ? "#222" : "#fff",
      marginBottom: 32,
      paddingVertical: 8,
    },
    tokenItem: {
      paddingHorizontal: 16,
      paddingVertical: 5,
    },
    tokenHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    tokenIconContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    tokenIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    tokenIconFallback: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDarkMode ? "#444" : "#e0e0e0",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    tokenIconText: {
      fontSize: 16,
      fontWeight: "bold",
      color: isDarkMode ? "#fff" : "#333",
    },
    tokenInfo: {
      flex: 1,
    },
    tokenSymbol: {
      fontSize: 16,
      fontWeight: "bold",
      color: isDarkMode ? "#fff" : "#333",
    },
    tokenName: {
      fontSize: 12,
      color: isDarkMode ? "#aaa" : "#666",
      marginTop: 2,
    },
    tokenBalanceContainer: {
      alignItems: "flex-end",
    },
    tokenBalanceValue: {
      fontSize: 16,
      fontWeight: "700",
      color: isDarkMode ? "#fff" : "#333",
      fontFamily: "monospace",
    },
    tokenBalanceUsd: {
      fontSize: 12,
      color: isDarkMode ? "#aaa" : "#888",
      marginTop: 2,
    },
    tokenDetails: {
      marginTop: 4,
    },
    contractAddress: {
      fontSize: 10,
      color: isDarkMode ? "#666" : "#999",
      fontFamily: "monospace",
    },
    tokenPrice: {
      fontSize: 12,
      color: isDarkMode ? "#666" : "#999",
      marginTop: 2,
    },
    tokenLoadingContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 20,
    },
    tokenLoadingText: {
      fontSize: 14,
      color: isDarkMode ? "#aaa" : "#888",
      marginLeft: 8,
    },
    noTokensContainer: {
      backgroundColor: isDarkMode ? "#222" : "#fff",
      borderRadius: 15,
      marginHorizontal: 16,
      marginBottom: 32,
      paddingVertical: 40,
      alignItems: "center",
    },
    noTokensText: {
      fontSize: 16,
      fontWeight: "600",
      color: isDarkMode ? "#fff" : "#333",
      textAlign: "center",
    },
    noTokensSubText: {
      fontSize: 14,
      color: isDarkMode ? "#aaa" : "#666",
      textAlign: "center",
      marginTop: 4,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    separator: {
      height: 1,
      backgroundColor: isDarkMode ? "#444" : "#e0e0e0",
      marginVertical: 8,
    },
  });
