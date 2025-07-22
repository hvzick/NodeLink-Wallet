import { copyToClipboard } from "@/utils/GlobalUtils/CopyToClipboard";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BalanceCardProps {
  totalPortfolioValue: number;
  balance: string;
  ethPriceUsd: number;
  showValue: boolean;
  onToggleShow: () => void;
  walletAddress: string;
  onQRPress: () => void; // New prop for QR navigation
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  totalPortfolioValue,
  balance,
  ethPriceUsd,
  showValue,
  onToggleShow,
  walletAddress,
  onQRPress, // Destructure new prop
}) => {
  const [copied, setCopied] = useState(false);

  const formattedUsd = totalPortfolioValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedEth = Number(balance).toFixed(2);
  const maskedUsd = "****";
  const maskedEth = "***.**";

  // Mask address: first 6 chars + '...' + last 4 chars
  const shortAddress =
    walletAddress.length > 12
      ? `${walletAddress.slice(0, 15)}...${walletAddress.slice(-15)}`
      : walletAddress;

  const handleCopy = () => {
    copyToClipboard(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.balanceCard}>
      {/* Wallet Address - inline with label */}
      <View style={styles.addressRow}>
        <Text style={styles.label}>Address: </Text>
        <Text style={styles.address}>{shortAddress}</Text>
        <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
          <Ionicons
            name={copied ? "checkmark" : "copy-outline"}
            size={18}
            color={copied ? "#007AFF" : "#666"}
          />
        </TouchableOpacity>
      </View>

      {/* Value row with eye and QR icons */}
      <View style={styles.row}>
        <Text style={styles.balanceValue}>
          $ {showValue ? formattedUsd : maskedUsd}
        </Text>
        <TouchableOpacity onPress={onToggleShow} style={styles.eyeButton}>
          <Ionicons
            name={showValue ? "eye" : "eye-off"}
            size={24}
            color="#000"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onQRPress} style={styles.qrButton}>
          <Ionicons name="qr-code-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.ethBalance}>
        {showValue ? formattedEth : maskedEth} ETH ($
        {ethPriceUsd.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
        /ETH)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 20,
    paddingTop: 5,
    alignItems: "flex-start",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginVertical: 8,
  },
  eyeButton: {
    marginLeft: 8,
  },
  qrButton: {
    marginLeft: 8,
    padding: 4,
  },
  ethBalance: {
    fontSize: 14,
    color: "#000",
    opacity: 0.8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    fontFamily: "monospace",
    color: "#000",
  },
  copyButton: {
    marginLeft: 8,
  },
});
