import { ALCHEMY_API_KEY, ALCHEMY_NETWORK } from "@env";
import { Alchemy, Network } from "alchemy-sdk";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { copyToClipboard } from "../../../../utils/GlobalUtils/CopyToClipboard";
import { useThemeToggle } from "../../../../utils/GlobalUtils/ThemeProvider"; // Import theme provider

import { formatTimeAgo } from "../../../../utils/WalletUtils/dateFormatter";
import { clearWalletData } from "../../../../utils/WalletUtils/walletStorage";
import { ActionButtons } from "../components/ActionButtons";
import { BalanceCard } from "../components/BalanceCard";
import { ExportPrivateKey } from "../components/ExportPrivateKey";
import { NetworkSelector } from "../components/NetworkSelector";
import { usePriceData } from "../hooks/usePriceData";
import { useWalletData } from "../hooks/useWalletData";
import { NetworkModal } from "../modals/NetworkModal";
import { SettingsModal } from "../modals/SettingsModal";
import { TransactionsModal } from "../modals/TransactionsModal";
import ReceiveScreen from "./ReceiveScreen";
import { TransactionsPage } from "./TransactionsPage";

interface WalletScreenProps {
  onWalletRemoved: () => void;
}

export default function WalletScreen({ onWalletRemoved }: WalletScreenProps) {
  const { currentTheme } = useThemeToggle(); // Use theme provider
  const isDarkMode = currentTheme === "dark";

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showNetworkModal, setShowNetworkModal] = useState<boolean>(false);
  const [showTransactionsModal, setShowTransactionsModal] =
    useState<boolean>(false);
  const [showReceiveScreen, setShowReceiveScreen] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("ethereum");
  const [showCopied, setShowCopied] = useState<boolean>(false);
  const [showTransactionsPage, setShowTransactionsPage] = useState(false);

  const alchemy = React.useMemo(
    () =>
      new Alchemy({
        apiKey: ALCHEMY_API_KEY,
        network: (Network as any)[ALCHEMY_NETWORK],
      }),
    []
  );

  const { ethPriceUsd, fetchEthPrice, fetchTokenPrices } = usePriceData();
  const {
    address,
    balance,
    networkName,
    latestBlock,
    tokenBalances,
    recentTransactions,
    totalPortfolioValue,
    loadWalletInfo,
  } = useWalletData(alchemy);

  const handleCopyAddress = async () => {
    if (address) {
      await copyToClipboard(address);
      setShowCopied(true);

      setTimeout(() => {
        setShowCopied(false);
      }, 2000);
    }
  };

  const handleNetworkChange = (networkId: string) => {
    setSelectedNetwork(networkId);
    setShowNetworkModal(false);
    const networkNames = {
      ethereum: "Ethereum Mainnet",
      sepolia: "Sepolia Testnet",
    };
    Alert.alert(
      "Network Changed",
      `Switched to ${networkNames[networkId as keyof typeof networkNames]}`
    );
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
            } catch (error) {
              Alert.alert("Error", "Failed to remove wallet data");
            }
          },
        },
      ]
    );
  };

  const handleViewOnEtherscan = async () => {
    if (address) {
      const url = `https://etherscan.io/address/${address}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        setShowSettingsModal(false);
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open Etherscan");
      }
    }
  };

  const handleShareAddress = () => {
    if (address) {
      setShowSettingsModal(false);
      handleCopyAddress();
    }
  };

  const handleSend = () => {
    Alert.alert("Send", "Send functionality will be implemented here");
  };

  const handleReceive = () => {
    setShowReceiveScreen(true);
  };

  const handleSwap = () => {
    Alert.alert("Swap", "Swap functionality will be implemented here");
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWalletInfo(fetchEthPrice, fetchTokenPrices, onWalletRemoved).finally(
      () => {
        setLoading(false);
        setRefreshing(false);
      }
    );
  };

  useEffect(() => {
    loadWalletInfo(fetchEthPrice, fetchTokenPrices, onWalletRemoved).finally(
      () => setLoading(false)
    );
  }, [loadWalletInfo, fetchEthPrice, fetchTokenPrices, onWalletRemoved]);

  const styles = getStyles(isDarkMode); // Get styles based on theme

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading real blockchain data...</Text>
      </SafeAreaView>
    );
  }

  // Show Receive Screen
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
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Wallet</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowSettingsModal(true)}
          >
            <Icon
              name="settings"
              size={20}
              color={isDarkMode ? "#fff" : "#000000"}
            />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <BalanceCard
          totalPortfolioValue={totalPortfolioValue}
          balance={balance}
          ethPriceUsd={ethPriceUsd}
        />

        {/* Network Selector */}
        <NetworkSelector
          selectedNetwork={selectedNetwork}
          onNetworkPress={() => setShowNetworkModal(true)}
        />

        {/* Action Buttons */}
        <ActionButtons
          onSend={handleSend}
          onReceive={handleReceive}
          onSwap={handleSwap}
        />

        {/* Address Section with Blue Box */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="account-circle" size={20} color="#007AFF" />
            <Text style={styles.cardTitle}>Wallet Address</Text>
          </View>
          <TouchableOpacity
            style={styles.addressBox}
            onPress={handleCopyAddress}
          >
            <View style={styles.addressContent}>
              <Text
                style={styles.addressText}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {address}
              </Text>
              <View style={styles.copyIconContainer}>
                {showCopied ? (
                  <>
                    <Icon name="check" size={16} color="#ffffff" />
                    <Text style={styles.copiedText}>Copied</Text>
                  </>
                ) : (
                  <Icon name="content-copy" size={16} color="#ffffff" />
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Network & Block Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="language" size={20} color="#007AFF" />
            <Text style={styles.cardTitle}>Network Information</Text>
          </View>
          <View style={styles.networkInfo}>
            <Text style={styles.networkItem}>Network: {networkName}</Text>
            <Text style={styles.networkItem}>
              Latest Block:{" "}
              {latestBlock !== null ? `#${latestBlock.toLocaleString()}` : "—"}
            </Text>
            <Text style={styles.networkItem}>
              ETH Price: ${ethPriceUsd.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Token Balances */}
        {tokenBalances.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="toll" size={20} color="#007AFF" />
              <Text style={styles.cardTitle}>Token Holdings</Text>
            </View>
            {tokenBalances.map((token, index) => (
              <View key={index} style={styles.tokenRow}>
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenSymbol}>{token.tokenSymbol}</Text>
                  <Text style={styles.tokenName}>{token.tokenName}</Text>
                </View>
                <View style={styles.tokenBalanceInfo}>
                  <Text style={styles.tokenBalance}>
                    {parseFloat(token.tokenBalance).toFixed(4)}
                  </Text>
                  {token.balanceUsd !== undefined && token.balanceUsd > 0 && (
                    <Text style={styles.tokenBalanceUsd}>
                      ${token.balanceUsd.toFixed(2)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="history" size={20} color="#007AFF" />
              <Text style={styles.cardTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => setShowTransactionsModal(true)}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            {recentTransactions.slice(0, 3).map((tx, index) => (
              <View key={index} style={styles.transactionRow}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionType}>
                    {tx.to.toLowerCase() === address?.toLowerCase()
                      ? "Received"
                      : "Sent"}
                  </Text>
                  <Text style={styles.transactionTime}>
                    {formatTimeAgo(tx.timeStamp)}
                  </Text>
                </View>
                <Text style={styles.transactionAmount}>
                  {parseFloat(tx.value).toFixed(4)} ETH
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <NetworkModal
        visible={showNetworkModal}
        selectedNetwork={selectedNetwork}
        onClose={() => setShowNetworkModal(false)}
        onNetworkChange={handleNetworkChange}
      />

      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onRemoveWallet={handleRemoveWallet}
        onViewOnEtherscan={handleViewOnEtherscan}
        onShareAddress={handleShareAddress}
        walletAddress={address ?? undefined}
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
        walletAddress={address ?? null}
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
      />
    </SafeAreaView>
  );
}

const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    // Main Container Styles
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#1C1C1D" : "#f5f5f5",
    },
    safeArea: {
      flex: 1,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDarkMode ? "#1C1C1D" : "#f5f5f5",
    },
    content: {
      padding: 16,
      paddingBottom: 32,
    },

    // Header Styles
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 24,
      paddingHorizontal: 4,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: isDarkMode ? "#fff" : "#1a1a1a",
      letterSpacing: -0.5,
    },
    lastUpdated: {
      fontSize: 12,
      color: isDarkMode ? "#999" : "#666",
      marginTop: 4,
      fontWeight: "500",
    },
    settingsButton: {
      padding: 8,
      borderRadius: 12,
    },
    backButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: "rgba(0, 122, 255, 0.1)",
    },
    placeholder: {
      width: 40,
    },

    // Loading Styles
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: isDarkMode ? "#999" : "#666",
      textAlign: "center",
      fontWeight: "500",
    },

    // Card Styles
    card: {
      backgroundColor: isDarkMode ? "#121212" : "#ffffff",
      borderRadius: 16,
      padding: 18,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDarkMode ? 0.3 : 0.08,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: isDarkMode ? "#333" : "rgba(0, 0, 0, 0.04)",
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginLeft: 10,
      color: isDarkMode ? "#fff" : "#1a1a1a",
      flex: 1,
      letterSpacing: -0.2,
    },
    viewAll: {
      fontSize: 14,
      color: "#007AFF",
      fontWeight: "600",
      letterSpacing: 0.1,
    },

    // Blue Address Box Styles
    addressBox: {
      backgroundColor: "#007AFF",
      borderRadius: 12,
      padding: 16,
      shadowColor: "#007AFF",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    addressContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    addressText: {
      fontSize: 14,
      fontFamily: "monospace",
      color: "#ffffff",
      fontWeight: "600",
      flex: 1,
      marginRight: 12,
    },
    copyIconContainer: {
      flexDirection: "row",
      alignItems: "center",
      minWidth: 60,
      justifyContent: "flex-end",
    },
    copiedText: {
      fontSize: 12,
      color: "#ffffff",
      fontWeight: "600",
      marginLeft: 4,
    },

    // Network Info Styles
    networkInfo: {
      gap: 10,
    },
    networkItem: {
      fontSize: 15,
      color: isDarkMode ? "#ddd" : "#374151",
      fontWeight: "500",
      paddingVertical: 2,
    },

    // Token Styles
    tokenRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "#333" : "#f3f4f6",
    },
    tokenInfo: {
      flex: 1,
    },
    tokenSymbol: {
      fontSize: 16,
      fontWeight: "700",
      color: isDarkMode ? "#fff" : "#1a1a1a",
      letterSpacing: -0.2,
    },
    tokenName: {
      fontSize: 13,
      color: isDarkMode ? "#999" : "#6b7280",
      marginTop: 2,
      fontWeight: "500",
    },
    tokenBalanceInfo: {
      alignItems: "flex-end",
    },
    tokenBalance: {
      fontSize: 16,
      fontWeight: "700",
      color: isDarkMode ? "#fff" : "#111827",
      letterSpacing: -0.2,
    },
    tokenBalanceUsd: {
      fontSize: 13,
      color: isDarkMode ? "#999" : "#6b7280",
      marginTop: 2,
      fontWeight: "500",
    },

    // Transaction Styles
    transactionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "#333" : "#f3f4f6",
    },
    transactionInfo: {
      flex: 1,
    },
    transactionType: {
      fontSize: 15,
      fontWeight: "600",
      color: isDarkMode ? "#fff" : "#1a1a1a",
      letterSpacing: -0.1,
    },
    transactionTime: {
      fontSize: 12,
      color: isDarkMode ? "#999" : "#6b7280",
      marginTop: 3,
      fontWeight: "500",
    },
    transactionAmount: {
      fontSize: 15,
      fontWeight: "700",
      color: isDarkMode ? "#fff" : "#111827",
      fontFamily: "monospace",
      letterSpacing: -0.2,
    },

    // Color Variants
    primaryText: {
      color: isDarkMode ? "#fff" : "#1a1a1a",
    },
    secondaryText: {
      color: isDarkMode ? "#999" : "#6b7280",
    },
    accentColor: {
      color: "#007AFF",
    },
    successColor: {
      color: "#10b981",
    },
    warningColor: {
      color: "#f59e0b",
    },
    errorColor: {
      color: "#ef4444",
    },

    // Background Colors
    backgroundPrimary: {
      backgroundColor: isDarkMode ? "#121212" : "#ffffff",
    },
    backgroundSecondary: {
      backgroundColor: isDarkMode ? "#1C1C1D" : "#f8f9fa",
    },
    backgroundAccent: {
      backgroundColor: "#007AFF",
    },
    backgroundSuccess: {
      backgroundColor: isDarkMode ? "#0f2419" : "#dcfce7",
    },
    backgroundWarning: {
      backgroundColor: isDarkMode ? "#2d1b0f" : "#fef3c7",
    },
    backgroundError: {
      backgroundColor: isDarkMode ? "#2d0f0f" : "#fee2e2",
    },
  });
