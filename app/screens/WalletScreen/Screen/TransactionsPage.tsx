import { Alchemy, AssetTransfersCategory, SortingOrder } from "alchemy-sdk";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
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
import { formatTimeAgo } from "../../../../utils/WalletUtils/dateFormatter";

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
  tokenSymbol?: string;
  tokenName?: string;
  category: string;
}

interface TransactionsPageProps {
  visible: boolean;
  onClose: () => void;
  walletAddress: string;
  alchemy: Alchemy;
  selectedNetwork: "ethereum" | "sepolia";
}

interface TransactionDetailModalProps {
  visible: boolean;
  transaction: Transaction | null;
  walletAddress: string;
  onClose: () => void;
  selectedNetwork: "ethereum" | "sepolia";
}

// ------------- Helper: Get Etherscan Transaction URL for Network -------------
function getEtherscanTxUrl(hash: string, net: string) {
  switch (net) {
    case "sepolia":
      return `https://sepolia.etherscan.io/tx/${hash}`;
    case "ethereum":
    default:
      return `https://etherscan.io/tx/${hash}`;
  }
}

// ------------------- Transaction Detail Modal Component ---------------------
const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  visible,
  transaction,
  walletAddress,
  selectedNetwork,
  onClose,
}) => {
  const [showCopied, setShowCopied] = useState<string>("");

  if (!transaction) return null;

  const isReceived =
    transaction.to.toLowerCase() === walletAddress.toLowerCase();
  const transactionType = isReceived ? "Received" : "Sent";
  const transactionColor = isReceived ? "#34C759" : "#FF9500";

  const handleCopy = async (text: string, type: string) => {
    await copyToClipboard(text);
    setShowCopied(type);
    setTimeout(() => setShowCopied(""), 2000);
  };

  const handleViewOnEtherscan = async () => {
    const url = getEtherscanTxUrl(transaction.hash, selectedNetwork);
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Cannot open Etherscan");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.detailContainer}>
        {/* Header */}
        <View style={styles.detailHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.detailTitle}>Transaction Details</Text>
          <TouchableOpacity
            style={styles.etherscanButton}
            onPress={handleViewOnEtherscan}
          >
            <Icon name="open-in-new" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.detailContent}>
          {/* Transaction Status */}
          <View style={styles.statusCard}>
            <View
              style={[
                styles.statusIcon,
                { backgroundColor: `${transactionColor}20` },
              ]}
            >
              <Icon
                name={isReceived ? "call-received" : "call-made"}
                size={32}
                color={transactionColor}
              />
            </View>
            <Text style={[styles.statusText, { color: transactionColor }]}>
              {transactionType}
            </Text>
            <Text style={styles.amountText}>
              {parseFloat(transaction.value).toFixed(6)}{" "}
              {transaction.tokenSymbol || "ETH"}
            </Text>
            <Text style={styles.statusDescription}>
              {transaction.status === "1" ? "Confirmed" : "Failed"}
            </Text>
          </View>

          {/* Transaction Details */}
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Transaction Information</Text>
            {/* Hash */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction Hash</Text>
              <TouchableOpacity
                style={styles.copyableField}
                onPress={() => handleCopy(transaction.hash, "hash")}
              >
                <Text style={styles.detailValue} numberOfLines={1}>
                  {transaction.hash}
                </Text>
                <Icon
                  name={showCopied === "hash" ? "check" : "content-copy"}
                  size={16}
                  color="#007AFF"
                />
              </TouchableOpacity>
            </View>
            {/* From Address */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>From</Text>
              <TouchableOpacity
                style={styles.copyableField}
                onPress={() => handleCopy(transaction.from, "from")}
              >
                <Text style={styles.detailValue} numberOfLines={1}>
                  {transaction.from}
                </Text>
                <Icon
                  name={showCopied === "from" ? "check" : "content-copy"}
                  size={16}
                  color="#007AFF"
                />
              </TouchableOpacity>
            </View>
            {/* To Address */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>To</Text>
              <TouchableOpacity
                style={styles.copyableField}
                onPress={() => handleCopy(transaction.to, "to")}
              >
                <Text style={styles.detailValue} numberOfLines={1}>
                  {transaction.to}
                </Text>
                <Icon
                  name={showCopied === "to" ? "check" : "content-copy"}
                  size={16}
                  color="#007AFF"
                />
              </TouchableOpacity>
            </View>
            {/* Block Number */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Block Number</Text>
              <Text style={styles.detailValue}>#{transaction.blockNumber}</Text>
            </View>
            {/* Timestamp */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Timestamp</Text>
              <Text style={styles.detailValue}>
                {new Date(transaction.timeStamp).toLocaleString()}
              </Text>
            </View>
            {/* Category */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>
                {transaction.category === "erc20"
                  ? "Token Transfer"
                  : "ETH Transfer"}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsCard}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleViewOnEtherscan}
            >
              <Icon name="visibility" size={20} color="#007AFF" />
              <Text style={styles.actionText}>View on Etherscan</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// ------------------- Main Transactions Page Component -----------------------

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  visible,
  onClose,
  walletAddress,
  alchemy,
  selectedNetwork,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageKey, setPageKey] = useState<string | undefined>(undefined);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchTransactions = useCallback(
    async (refresh: boolean = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
          setTransactions([]);
          setPageKey(undefined);
          setHasMore(true);
        } else {
          setLoading(true);
        }
        // Parallel fetch
        const [
          ethTransfersFrom,
          ethTransfersTo,
          erc20TransfersFrom,
          erc20TransfersTo,
        ] = await Promise.all([
          alchemy.core.getAssetTransfers({
            fromAddress: walletAddress,
            category: [AssetTransfersCategory.EXTERNAL],
            maxCount: 50,
            order: SortingOrder.DESCENDING,
            pageKey: refresh ? undefined : pageKey,
          }),
          alchemy.core.getAssetTransfers({
            toAddress: walletAddress,
            category: [AssetTransfersCategory.EXTERNAL],
            maxCount: 50,
            order: SortingOrder.DESCENDING,
            pageKey: refresh ? undefined : pageKey,
          }),
          alchemy.core.getAssetTransfers({
            fromAddress: walletAddress,
            category: [AssetTransfersCategory.ERC20],
            maxCount: 50,
            order: SortingOrder.DESCENDING,
            pageKey: refresh ? undefined : pageKey,
          }),
          alchemy.core.getAssetTransfers({
            toAddress: walletAddress,
            category: [AssetTransfersCategory.ERC20],
            maxCount: 50,
            order: SortingOrder.DESCENDING,
            pageKey: refresh ? undefined : pageKey,
          }),
        ]);
        // Combine
        const allTransfers = [
          ...ethTransfersFrom.transfers,
          ...ethTransfersTo.transfers,
          ...erc20TransfersFrom.transfers,
          ...erc20TransfersTo.transfers,
        ];
        const formattedTransactions: Transaction[] = allTransfers.map((tx) => ({
          hash: tx.hash || "",
          from: tx.from || "",
          to: tx.to || "",
          value: tx.value?.toString() || "0",
          gasUsed: "0",
          gasPrice: "0",
          timeStamp:
            (tx as any).metadata?.blockTimestamp || new Date().toISOString(),
          status: "1",
          blockNumber: parseInt((tx.blockNum || "0").replace("0x", ""), 16),
          tokenSymbol: (tx as any).asset || "ETH",
          tokenName: (tx as any).tokenName || "Ethereum",
          category: tx.category,
        }));
        // Remove duplicates and sort
        const uniqueTransactions = formattedTransactions.filter(
          (tx, index, arr) => arr.findIndex((t) => t.hash === tx.hash) === index
        );
        uniqueTransactions.sort((a, b) => b.blockNumber - a.blockNumber);
        if (refresh) {
          setTransactions(uniqueTransactions);
        } else {
          setTransactions((prev) => {
            const combined = [...prev, ...uniqueTransactions];
            return combined.filter(
              (tx, index, arr) =>
                arr.findIndex((t) => t.hash === tx.hash) === index
            );
          });
        }
        const nextPageKey =
          ethTransfersFrom.pageKey ||
          ethTransfersTo.pageKey ||
          erc20TransfersFrom.pageKey ||
          erc20TransfersTo.pageKey;
        setPageKey(nextPageKey);
        setHasMore(!!nextPageKey && uniqueTransactions.length > 0);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        Alert.alert(
          "Error",
          "Failed to load transactions. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
        setInitialLoad(false);
      }
    },
    [alchemy, walletAddress, pageKey]
  );

  const loadMoreTransactions = () => {
    if (!loading && !refreshing && hasMore && pageKey) {
      fetchTransactions(false);
    }
  };
  const onRefresh = () => fetchTransactions(true);

  const handleTransactionPress = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const getTransactionIcon = (transaction: Transaction) => {
    const isReceived =
      transaction.to.toLowerCase() === walletAddress.toLowerCase();
    return isReceived ? "call-received" : "call-made";
  };
  const getTransactionColor = (transaction: Transaction) => {
    const isReceived =
      transaction.to.toLowerCase() === walletAddress.toLowerCase();
    return isReceived ? "#34C759" : "#FF9500";
  };
  const getTransactionType = (transaction: Transaction) => {
    const isReceived =
      transaction.to.toLowerCase() === walletAddress.toLowerCase();
    const baseType = isReceived ? "Received" : "Sent";
    const tokenType =
      transaction.category === "erc20" ? ` ${transaction.tokenSymbol}` : " ETH";
    return baseType + tokenType;
  };
  useEffect(() => {
    if (visible && initialLoad) fetchTransactions(true);
  }, [visible, fetchTransactions, initialLoad]);

  if (!visible) return null;
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Icon name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Transaction History</Text>
          <View style={styles.placeholder} />
        </View>

        {initialLoad && loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading transactions...</Text>
            <Text style={styles.loadingSubtext}>
              Fetching your transaction history from the blockchain
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.transactionsList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onMomentumScrollEnd={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } =
                nativeEvent;
              const isCloseToBottom =
                layoutMeasurement.height + contentOffset.y >=
                contentSize.height - 100;
              if (isCloseToBottom) {
                loadMoreTransactions();
              }
            }}
          >
            {transactions.length === 0 && !loading ? (
              <View style={styles.emptyState}>
                <Icon name="history" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>No Transactions Found</Text>
                <Text style={styles.emptyDescription}>
                  Your transaction history will appear here when you start using
                  your wallet.
                </Text>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={onRefresh}
                >
                  <Icon name="refresh" size={20} color="#007AFF" />
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {transactions.map((transaction, index) => (
                  <TouchableOpacity
                    key={`${transaction.hash}-${index}`}
                    style={styles.transactionItem}
                    onPress={() => handleTransactionPress(transaction)}
                  >
                    <View style={styles.transactionLeft}>
                      <View
                        style={[
                          styles.transactionIcon,
                          {
                            backgroundColor: `${getTransactionColor(
                              transaction
                            )}20`,
                          },
                        ]}
                      >
                        <Icon
                          name={getTransactionIcon(transaction)}
                          size={20}
                          color={getTransactionColor(transaction)}
                        />
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionType}>
                          {getTransactionType(transaction)}
                        </Text>
                        <Text style={styles.transactionHash}>
                          {transaction.hash.substring(0, 10)}...
                          {transaction.hash.substring(
                            transaction.hash.length - 6
                          )}
                        </Text>
                        <Text style={styles.transactionTime}>
                          {formatTimeAgo(transaction.timeStamp)} • Block #
                          {transaction.blockNumber}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.transactionRight}>
                      <Text
                        style={[
                          styles.transactionValue,
                          { color: getTransactionColor(transaction) },
                        ]}
                      >
                        {transaction.to.toLowerCase() ===
                        walletAddress.toLowerCase()
                          ? "+"
                          : "-"}
                        {parseFloat(transaction.value).toFixed(6)}
                      </Text>
                      <Text style={styles.transactionSymbol}>
                        {transaction.tokenSymbol || "ETH"}
                      </Text>
                      <Icon name="chevron-right" size={16} color="#999" />
                    </View>
                  </TouchableOpacity>
                ))}

                {loading && (
                  <View style={styles.loadingMore}>
                    <ActivityIndicator size="small" color="#007AFF" />
                    <Text style={styles.loadingMoreText}>
                      Loading more transactions...
                    </Text>
                  </View>
                )}

                {!hasMore && transactions.length > 0 && (
                  <View style={styles.endMessage}>
                    <Icon name="check-circle" size={20} color="#10B981" />
                    <Text style={styles.endMessageText}>
                      All transactions loaded
                    </Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        )}

        {/* Transaction Detail Modal */}
        <TransactionDetailModal
          visible={showDetailModal}
          transaction={selectedTransaction}
          walletAddress={walletAddress}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTransaction(null);
          }}
          selectedNetwork={selectedNetwork}
        />
      </SafeAreaView>
    </Modal>
  );
};

// ----------- StyleSheet: Colors, Size, and Shape from SettingsScreen -----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  title: {
    fontSize: 25,
    fontWeight: "600",
    color: "#333333",
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  transactionsList: { flex: 1 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderRadius: 8,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginLeft: 8,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  transactionLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    // backgroundColor set runtime for accent
  },
  transactionInfo: { flex: 1 },
  transactionType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 2,
  },
  transactionHash: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#6B7280",
    marginBottom: 2,
  },
  transactionTime: { fontSize: 11, color: "#9CA3AF" },
  transactionRight: { alignItems: "flex-end" },
  transactionValue: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  transactionSymbol: {
    fontSize: 11,
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  loadingMore: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingMoreText: { marginLeft: 8, fontSize: 14, color: "#6B7280" },
  endMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 8,
  },
  endMessageText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "500",
  },
  detailContainer: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  closeButton: { padding: 8 },
  detailTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  etherscanButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  detailContent: { flex: 1, padding: 20 },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  statusText: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  amountText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  detailRow: { marginBottom: 16 },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#374151",
    fontFamily: "monospace",
    flex: 1,
  },
  copyableField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderRadius: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginLeft: 8,
  },
});
