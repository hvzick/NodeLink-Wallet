import React from "react";
import {
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { formatTimeAgo } from "../../../../utils/WalletUtils/dateFormatter";

type SupportedNetwork = "ethereum" | "sepolia";

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

interface TransactionsModalProps {
  visible: boolean;
  onClose: () => void;
  transactions: Transaction[];
  walletAddress: string | null;
  selectedNetwork: SupportedNetwork; // ADD THIS
}

function getEtherscanTxUrl(hash: string, network: SupportedNetwork) {
  if (network === "sepolia") return `https://sepolia.etherscan.io/tx/${hash}`;
  return `https://etherscan.io/tx/${hash}`;
}

export const TransactionsModal: React.FC<TransactionsModalProps> = ({
  visible,
  onClose,
  transactions,
  walletAddress,
  selectedNetwork,
}) => {
  const handleTransactionPress = async (hash: string) => {
    if (hash) {
      const url = getEtherscanTxUrl(hash, selectedNetwork);
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    }
  };

  const getTransactionIcon = (tx: Transaction) => {
    const isReceived = tx.to.toLowerCase() === walletAddress?.toLowerCase();
    return isReceived ? "call-received" : "call-made";
  };

  const getTransactionColor = (tx: Transaction) => {
    const isReceived = tx.to.toLowerCase() === walletAddress?.toLowerCase();
    return isReceived ? "#4CAF50" : "#FF9500";
  };

  const getTransactionType = (tx: Transaction) => {
    const isReceived = tx.to.toLowerCase() === walletAddress?.toLowerCase();
    return isReceived ? "Received ETH" : "Sent ETH";
  };

  const formatTransactionValue = (tx: Transaction) => {
    const isReceived = tx.to.toLowerCase() === walletAddress?.toLowerCase();
    const prefix = isReceived ? "+" : "-";
    return `${prefix}${parseFloat(tx.value).toFixed(4)} ETH`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Transaction History</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="history" size={64} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No Transactions</Text>
              <Text style={styles.emptyStateText}>
                Your transaction history will appear here
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.transactionsList}
              showsVerticalScrollIndicator={false}
            >
              {transactions.map((tx, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.transactionItem}
                  onPress={() => handleTransactionPress(tx.hash)}
                >
                  <View style={styles.transactionLeft}>
                    <View
                      style={[
                        styles.transactionIcon,
                        { backgroundColor: `${getTransactionColor(tx)}20` },
                      ]}
                    >
                      <Icon
                        name={getTransactionIcon(tx)}
                        size={20}
                        color={getTransactionColor(tx)}
                      />
                    </View>

                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionType}>
                        {getTransactionType(tx)}
                      </Text>
                      <Text style={styles.transactionHash}>
                        {tx.hash.substring(0, 10)}...
                        {tx.hash.substring(tx.hash.length - 6)}
                      </Text>
                      <Text style={styles.transactionTime}>
                        {formatTimeAgo(tx.timeStamp)} • Block #{tx.blockNumber}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.transactionRight}>
                    <Text
                      style={[
                        styles.transactionValue,
                        { color: getTransactionColor(tx) },
                      ]}
                    >
                      {formatTransactionValue(tx)}
                    </Text>
                    <Text style={styles.transactionStatus}>
                      {tx.status === "1" ? "Confirmed" : "Failed"}
                    </Text>
                    <Icon name="open-in-new" size={16} color="#999" />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Tap any transaction to view on Etherscan
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- (Styles: same, or update as desired for your theme) ---
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  closeButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  transactionHash: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#666",
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 12,
    color: "#999",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionValue: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  transactionStatus: {
    fontSize: 11,
    color: "#4CAF50",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});
