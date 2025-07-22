/* eslint-disable @typescript-eslint/no-unused-vars */
import { ALCHEMY_API_KEY, ALCHEMY_NETWORK } from "@env";
import { Alchemy, Network } from "alchemy-sdk";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { copyToClipboard } from "../../../../utils/GlobalUtils/CopyToClipboard";
import { useThemeToggle } from "../../../../utils/GlobalUtils/ThemeProvider";

import { formatTimeAgo } from "../../../../utils/WalletUtils/dateFormatter";
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

  const styles = getStyles(isDarkMode);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            Loading real blockchain data...
          </Text>
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

        {/* Action Buttons */}
        <ActionButtons
          onSend={handleSend}
          onReceive={handleReceive}
          onSwap={handleSwap}
        />

        {/* Token Holdings - ADDED BELOW Send & Receive */}
        {tokenBalances.length > 0 && (
          <>
            <Text style={styles.label}>Token Holdings</Text>
            <View style={styles.tokensContainer}>
              {tokenBalances.map((token, idx) => (
                <View key={idx}>
                  <View style={styles.tokenItem}>
                    <View style={styles.tokenRow}>
                      <Text style={styles.tokenLabel}>Symbol:</Text>
                      <Text style={styles.tokenValue}>{token.tokenSymbol}</Text>
                    </View>
                    <View style={styles.tokenRow}>
                      <Text style={styles.tokenLabel}>Name:</Text>
                      <Text style={styles.tokenValue}>{token.tokenName}</Text>
                    </View>
                    <View style={styles.tokenRowLast}>
                      <Text style={styles.tokenLabel}>Balance:</Text>
                      <View style={styles.tokenBalanceInfo}>
                        <Text style={styles.tokenBalance}>
                          {parseFloat(token.tokenBalance).toFixed(4)}
                        </Text>
                        {token.balanceUsd !== undefined &&
                          token.balanceUsd > 0 && (
                            <Text style={styles.tokenBalanceUsd}>
                              ${token.balanceUsd.toFixed(2)}
                            </Text>
                          )}
                      </View>
                    </View>
                  </View>
                  {idx < tokenBalances.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {/* Network & Block Info */}
        <Text style={styles.label}>Network Information</Text>
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Network:</Text>
              <Text style={styles.infoValue}>{networkName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Latest Block:</Text>
              <Text style={styles.infoValue}>
                {latestBlock !== null
                  ? `#${latestBlock.toLocaleString()}`
                  : "—"}
              </Text>
            </View>
            <View style={styles.infoRowLast}>
              <Text style={styles.infoLabel}>ETH Price:</Text>
              <Text style={styles.infoValue}>
                ${ethPriceUsd.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Recent Activity</Text>
              <TouchableOpacity onPress={() => setShowTransactionsModal(true)}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.transactionsContainer}>
              {recentTransactions.slice(0, 3).map((tx, i) => (
                <View key={i}>
                  <View style={styles.transactionItem}>
                    <View style={styles.transactionRow}>
                      <Text style={styles.transactionLabel}>Type:</Text>
                      <Text style={styles.transactionType}>
                        {tx.to.toLowerCase() === address?.toLowerCase()
                          ? "Received"
                          : "Sent"}
                      </Text>
                    </View>
                    <View style={styles.transactionRow}>
                      <Text style={styles.transactionLabel}>Time:</Text>
                      <Text style={styles.transactionTime}>
                        {formatTimeAgo(tx.timeStamp)}
                      </Text>
                    </View>
                    <View style={styles.transactionRowLast}>
                      <Text style={styles.transactionLabel}>Amount:</Text>
                      <Text style={styles.transactionAmount}>
                        {parseFloat(tx.value).toFixed(4)} ETH
                      </Text>
                    </View>
                  </View>
                  {i < 2 && <View style={styles.separator} />}
                </View>
              ))}
            </View>
          </>
        )}
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
      borderRadius: 15,
      padding: 8,
      marginBottom: 32,
    },
    tokenItem: {
      backgroundColor: isDarkMode ? "#333" : "#f9f9f9",
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    tokenRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    tokenRowLast: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    tokenLabel: {
      width: 100,
      fontSize: 14,
      fontWeight: "600",
      color: isDarkMode ? "#fff" : "#333",
    },
    tokenValue: {
      flex: 1,
      fontSize: 14,
      color: isDarkMode ? "#fff" : "#555",
      marginLeft: 8,
    },
    tokenBalanceInfo: {
      flex: 1,
      alignItems: "flex-end",
      marginLeft: 8,
    },
    tokenBalance: {
      fontSize: 14,
      fontWeight: "700",
      color: isDarkMode ? "#fff" : "#333",
    },
    tokenBalanceUsd: {
      fontSize: 12,
      color: isDarkMode ? "#aaa" : "#888",
      marginTop: 2,
    },
    infoContainer: {
      backgroundColor: isDarkMode ? "#222" : "#fff",
      borderRadius: 15,
      padding: 8,
      marginBottom: 32,
    },
    infoItem: {
      backgroundColor: isDarkMode ? "#333" : "#f9f9f9",
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    infoRowLast: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    infoLabel: {
      width: 100,
      fontSize: 14,
      fontWeight: "600",
      color: isDarkMode ? "#fff" : "#333",
    },
    infoValue: {
      flex: 1,
      fontSize: 14,
      color: isDarkMode ? "#fff" : "#555",
      marginLeft: 8,
      textAlign: "right",
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    viewAll: {
      fontSize: 14,
      color: "#007AFF",
      fontWeight: "600",
    },
    transactionsContainer: {
      backgroundColor: isDarkMode ? "#222" : "#fff",
      borderRadius: 15,
      padding: 8,
      marginBottom: 32,
    },
    transactionItem: {
      backgroundColor: isDarkMode ? "#333" : "#f9f9f9",
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    transactionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    transactionRowLast: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    transactionLabel: {
      width: 100,
      fontSize: 14,
      fontWeight: "600",
      color: isDarkMode ? "#fff" : "#333",
    },
    transactionType: {
      flex: 1,
      fontSize: 14,
      color: isDarkMode ? "#fff" : "#555",
      marginLeft: 8,
    },
    transactionTime: {
      flex: 1,
      fontSize: 12,
      color: isDarkMode ? "#aaa" : "#888",
      marginLeft: 8,
    },
    transactionAmount: {
      flex: 1,
      fontSize: 14,
      fontWeight: "700",
      color: isDarkMode ? "#fff" : "#333",
      fontFamily: "monospace",
      marginLeft: 8,
      textAlign: "right",
    },
    separator: {
      height: 1,
      backgroundColor: isDarkMode ? "#444" : "#e0e0e0",
      marginVertical: 4,
    },
  });
