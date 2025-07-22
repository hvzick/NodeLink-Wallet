import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface NetworkSelectorProps {
  selectedNetwork: string;
  onNetworkPress: () => void;
}

const networks = [
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

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  selectedNetwork,
  onNetworkPress,
}) => {
  const currentNetwork = networks.find((n) => n.id === selectedNetwork);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Icon name="network-check" size={20} color="#007AFF" />
        <Text style={styles.cardTitle}>Network</Text>
      </View>
      <TouchableOpacity style={styles.networkSelector} onPress={onNetworkPress}>
        <View style={styles.networkOption}>
          <Icon
            name="link"
            size={20}
            color={currentNetwork?.color || "#627EEA"}
          />
          <Text style={styles.networkOptionText}>
            {currentNetwork?.name || "Ethereum Mainnet"}
          </Text>
        </View>
        <Icon name="keyboard-arrow-down" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    color: "#1a1a1a",
    flex: 1,
  },
  networkSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  networkOption: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  networkOptionText: {
    fontSize: 16,
    color: "#1a1a1a",
    marginLeft: 12,
    fontWeight: "500",
  },
});
