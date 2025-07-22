import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  clearWalletDataOnReload,
  getStoredWalletAddress,
} from "../../../../utils/WalletUtils/walletStorage";

interface WelcomeScreenProps {
  onNavigateToCreate: () => void;
  onNavigateToImport: () => void;
  onNavigateToWallet: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onNavigateToCreate,
  onNavigateToImport,
  onNavigateToWallet,
}) => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeApp = async () => {
      // Auto-clear wallet data on every reload for testing
      await clearWalletDataOnReload();

      // Check if wallet exists after clearing
      const storedAddress = await getStoredWalletAddress();
      if (storedAddress) {
        onNavigateToWallet();
      } else {
        setLoading(false);
      }
    };

    initializeApp();
  }, [onNavigateToWallet]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Icon name="account-balance-wallet" size={80} color="#007AFF" />
          <Text style={styles.title}>Welcome to NodeLink Wallet</Text>
          <Text style={styles.subtitle}>
            Choose an option to get started with your crypto wallet
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={onNavigateToCreate}
          >
            <Icon name="add-circle" size={32} color="#007AFF" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Create New Wallet</Text>
              <Text style={styles.optionDescription}>
                Generate a new wallet with a unique address and seed phrase
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={onNavigateToImport}
          >
            <Icon name="file-download" size={32} color="#34C759" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Import Existing Wallet</Text>
              <Text style={styles.optionDescription}>
                Import your wallet using private key or seed phrase
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Debug info - only show in development */}
        {__DEV__ && (
          <View style={styles.debugInfo}>
            <Icon name="science" size={16} color="#FF9500" />
            <Text style={styles.debugInfoText}>
              Testing Mode: Wallet data auto-cleared on reload
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#1a1a1a",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  optionsContainer: {
    marginBottom: 40,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  optionContent: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  debugInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff8e1",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  debugInfoText: {
    fontSize: 12,
    color: "#F57F17",
    marginLeft: 6,
    fontStyle: "italic",
  },
});
