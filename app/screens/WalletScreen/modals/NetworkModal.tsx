import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface Network {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface NetworkModalProps {
  visible: boolean;
  selectedNetwork: string;
  onClose: () => void;
  onNetworkChange: (networkId: string) => void;
}

const networks: Network[] = [
  {
    id: "ethereum",
    name: "Ethereum Mainnet",
    icon: "link",
    color: "#627EEA",
  },
  {
    id: "sepolia",
    name: "Sepolia Testnet",
    icon: "link",
    color: "#FF6B6B",
  },
];

export const NetworkModal: React.FC<NetworkModalProps> = ({
  visible,
  selectedNetwork,
  onClose,
  onNetworkChange,
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
            <Text style={styles.modalTitle}>Select Network</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {networks.map((network) => (
            <TouchableOpacity
              key={network.id}
              style={[
                styles.networkOption,
                selectedNetwork === network.id && styles.networkOptionSelected,
              ]}
              onPress={() => onNetworkChange(network.id)}
            >
              <Icon name={network.icon} size={24} color={network.color} />
              <Text style={styles.networkOptionText}>{network.name}</Text>
              {selectedNetwork === network.id && (
                <Icon name="check" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}

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
  networkOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  networkOptionSelected: {
    backgroundColor: "#f0f8ff",
  },
  networkOptionText: {
    fontSize: 16,
    color: "#1a1a1a",
    marginLeft: 12,
    flex: 1,
    fontWeight: "500",
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
