import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface BalanceCardProps {
  totalPortfolioValue: number;
  balance: string;
  ethPriceUsd: number;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  totalPortfolioValue,
  balance,
  ethPriceUsd,
}) => {
  return (
    <View style={styles.balanceCard}>
      <Text style={styles.balanceLabel}>Total Portfolio Value</Text>
      <Text style={styles.balanceValue}>
        $
        {totalPortfolioValue.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>
      <Text style={styles.ethBalance}>
        {balance} ETH (${ethPriceUsd.toLocaleString()}/ETH)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: "#007AFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 16,
    color: "#ffffff",
    opacity: 0.8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginVertical: 8,
  },
  ethBalance: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.8,
  },
});
