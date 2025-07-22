import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface ActionButtonsProps {
  onSend?: () => void;
  onReceive?: () => void;
  onSwap?: () => void;
}

// In ActionButtons.tsx
interface ActionButtonsProps {
  onSend?: () => void;
  onReceive?: () => void;
  onSwap?: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSend,
  onReceive,
  onSwap,
}) => {
  return (
    <View style={styles.actionCard}>
      <TouchableOpacity style={styles.actionButton} onPress={onSend}>
        <View style={styles.actionButtonIcon}>
          <Icon name="arrow-upward" size={24} color="#007AFF" />
        </View>
        <Text style={styles.actionButtonText}>Send</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={onReceive}>
        <View style={styles.actionButtonIcon}>
          <Icon name="arrow-downward" size={24} color="#007AFF" />
        </View>
        <Text style={styles.actionButtonText}>Receive</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={onSwap}>
        <View style={styles.actionButtonIcon}>
          <Icon name="swap-horiz" size={24} color="#007AFF" />
        </View>
        <Text style={styles.actionButtonText}>Swap</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    alignItems: "center",
    flex: 1,
  },
  actionButtonIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f8ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "500",
  },
});
