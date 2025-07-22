import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

// Add SupportedNetwork type
type SupportedNetwork = "ethereum" | "sepolia";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onRemoveWallet: () => void;
  onViewOnEtherscan?: () => void;
  onShareAddress?: () => void;
  walletAddress?: string;
  onExportPrivateKey?: () => void;
  onViewTransactions?: () => void;
  selectedNetwork: SupportedNetwork; // <-- Required for dynamic Etherscan text
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onRemoveWallet,
  onViewOnEtherscan,
  onShareAddress,
  walletAddress,
  onExportPrivateKey,
  onViewTransactions,
  selectedNetwork, // <-- use this prop!
}) => {
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
            <Text style={styles.modalTitle}>Wallet Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* View on Etherscan (dynamic text) */}
          {onViewOnEtherscan && (
            <TouchableOpacity
              style={styles.modalOption}
              onPress={onViewOnEtherscan}
            >
              <Icon name="visibility" size={24} color="#007AFF" />
              <Text style={styles.modalOptionText}>
                {selectedNetwork === "sepolia"
                  ? "View on Sepolia Etherscan"
                  : "View on Etherscan"}
              </Text>
              <Icon name="open-in-new" size={18} color="#666" />
            </TouchableOpacity>
          )}

          {/* Share Address */}
          {onShareAddress && (
            <TouchableOpacity
              style={styles.modalOption}
              onPress={onShareAddress}
            >
              <Icon name="share" size={24} color="#007AFF" />
              <Text style={styles.modalOptionText}>
                Share my public address
              </Text>
              <Icon name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
          )}

          {/* View Transactions */}
          {onViewTransactions && (
            <TouchableOpacity
              style={styles.modalOption}
              onPress={onViewTransactions}
            >
              <Icon name="history" size={24} color="#9C27B0" />
              <Text style={styles.modalOptionText}>Transaction History</Text>
              <Icon name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
          )}

          {/* Export Private Key */}
          <TouchableOpacity
            style={styles.modalOption}
            onPress={onExportPrivateKey}
          >
            <Icon name="vpn-key" size={24} color="#FF9500" />
            <Text style={styles.modalOptionText}>Export Private Key</Text>
            <Icon name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>

          {/* Backup Wallet */}
          <TouchableOpacity style={styles.modalOption}>
            <Icon name="backup" size={24} color="#34C759" />
            <Text style={styles.modalOptionText}>Backup Wallet</Text>
            <Icon name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Remove Wallet - Danger Zone */}
          <TouchableOpacity
            style={styles.dangerOption}
            onPress={onRemoveWallet}
          >
            <Icon name="delete-forever" size={24} color="#FF3B30" />
            <View style={styles.optionContent}>
              <Text style={styles.dangerOptionTitle}>Remove Wallet</Text>
              <Text style={styles.optionDescription}>
                Remove wallet from this device (make sure to backup first!)
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

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
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#1a1a1a",
    marginLeft: 12,
    flex: 1,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 8,
  },
  dangerOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffebee",
    borderRadius: 12,
    marginBottom: 12,
    marginTop: 8,
  },
  optionContent: {
    flex: 1,
    marginLeft: 16,
  },
  dangerOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
  },
  cancelButton: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
});
