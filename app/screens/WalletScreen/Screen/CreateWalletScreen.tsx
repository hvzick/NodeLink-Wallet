import { ethers } from "ethers";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Clipboard,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { storeWalletData } from "../../../../utils/WalletUtils/walletStorage";
import { showErrorAlert } from "../../../../utils/WalletUtils/walletUtils";

interface CreateWalletScreenProps {
  onWalletCreated: () => void;
  onBack: () => void;
}

const CreateWalletScreen: React.FC<CreateWalletScreenProps> = ({
  onWalletCreated,
  onBack,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [wallet, setWallet] = useState<ethers.Wallet | null>(null);
  const [mnemonic, setMnemonic] = useState<string>("");
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [buttonScale] = useState(new Animated.Value(1));
  const [copiedItem, setCopiedItem] = useState<string>("");

  const loadingSteps = [
    "Generating entropy...",
    "Creating private key...",
    "Generating mnemonic phrase...",
    "Deriving wallet address...",
    "Securing wallet data...",
    "Almost ready...",
  ];

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const createNewWallet = async () => {
    if (loading) return;

    animateButton();
    setLoading(true);
    setLoadingStep(0);

    try {
      for (let i = 0; i < loadingSteps.length; i++) {
        setLoadingStep(i);
        await new Promise((resolve) =>
          setTimeout(resolve, 400 + Math.random() * 300)
        );
      }

      const newWallet = ethers.Wallet.createRandom();
      const mnemonicPhrase = newWallet.mnemonic?.phrase || "";

      setWallet(newWallet);
      setMnemonic(mnemonicPhrase);

      await storeWalletData(newWallet.address, newWallet.privateKey);
    } catch (error) {
      console.error("Error creating wallet:", error);
      showErrorAlert("Failed to create wallet. Please try again.");
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    Clipboard.setString(text);
    setCopiedItem(type);

    setTimeout(() => {
      setCopiedItem("");
    }, 2000);
  };

  const proceedToWallet = () => {
    // Directly call onWalletCreated without showing alert
    onWalletCreated();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.backButton} />
          <Text style={styles.title}>Creating Wallet</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={styles.loadingSpinner}
          />

          <Text style={styles.loadingTitle}>Creating Your Secure Wallet</Text>
          <Text style={styles.loadingSubtitle}>
            Please wait while we generate your keys...
          </Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      ((loadingStep + 1) / loadingSteps.length) * 100
                    }%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(((loadingStep + 1) / loadingSteps.length) * 100)}%
            </Text>
          </View>

          <View style={styles.loadingStepsContainer}>
            {loadingSteps.map((step, index) => (
              <View key={index} style={styles.loadingStepItem}>
                <Icon
                  name={
                    index < loadingStep
                      ? "check"
                      : index === loadingStep
                      ? "hourglass-empty"
                      : "radio-button-unchecked"
                  }
                  size={20}
                  color={
                    index < loadingStep
                      ? "#34C759"
                      : index === loadingStep
                      ? "#007AFF"
                      : "#ccc"
                  }
                />
                <Text
                  style={[
                    styles.loadingStepText,
                    {
                      color: index <= loadingStep ? "#333" : "#999",
                      fontWeight: index === loadingStep ? "600" : "400",
                    },
                  ]}
                >
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            disabled={loading}
          >
            <Icon name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Create New Wallet</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.body}>
          {!wallet && (
            <Icon name="account-balance-wallet" size={80} color="#007AFF" />
          )}

          <Text style={styles.subtitle}>
            {!wallet
              ? "Create a new Ethereum wallet to get started"
              : "Your Wallet has been created successfully"}
          </Text>

          {!wallet ? (
            <>
              <View style={styles.infoCard}>
                <Icon name="info" size={24} color="#007AFF" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>What you&lsquo;ll get:</Text>
                  <Text style={styles.infoText}>
                    • A unique wallet address{"\n"}• A secure private key{"\n"}•
                    A 12-word recovery phrase{"\n"}• Full control of your funds
                  </Text>
                </View>
              </View>

              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={[styles.createButton, { opacity: loading ? 0.6 : 1 }]}
                  onPress={createNewWallet}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Icon name="add" size={24} color="#ffffff" />
                  <Text style={styles.buttonText}>Create Wallet</Text>
                </TouchableOpacity>
              </Animated.View>
            </>
          ) : (
            <View style={styles.successContainer}>
              <View style={styles.walletInfoCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.walletInfoLabel}>Wallet Address:</Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(wallet.address, "Address")}
                    style={styles.copyButton}
                  >
                    {copiedItem === "Address" ? (
                      <View style={styles.copiedIndicator}>
                        <Icon name="check" size={16} color="#34C759" />
                        <Text style={styles.copiedText}>Copied</Text>
                      </View>
                    ) : (
                      <Icon name="content-copy" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.walletInfoValue}>{wallet.address}</Text>
              </View>

              <View style={styles.walletInfoCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.walletInfoLabel}>
                    Seed Phrase (Mnemonic):
                  </Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(mnemonic, "Seed Phrase")}
                    style={styles.copyButton}
                  >
                    {copiedItem === "Seed Phrase" ? (
                      <View style={styles.copiedIndicator}>
                        <Icon name="check" size={16} color="#34C759" />
                        <Text style={styles.copiedText}>Copied</Text>
                      </View>
                    ) : (
                      <Icon name="content-copy" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                </View>
                <View style={styles.mnemonicContainer}>
                  {mnemonic.split(" ").map((word, index) => (
                    <View key={index} style={styles.mnemonicWord}>
                      <Text style={styles.mnemonicIndex}>{index + 1}</Text>
                      <Text style={styles.mnemonicText}>{word}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.walletInfoCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.walletInfoLabel}>Private Key:</Text>
                  <TouchableOpacity
                    onPress={() =>
                      copyToClipboard(wallet.privateKey, "Private Key")
                    }
                    style={styles.copyButton}
                  >
                    {copiedItem === "Private Key" ? (
                      <View style={styles.copiedIndicator}>
                        <Icon name="check" size={16} color="#34C759" />
                        <Text style={styles.copiedText}>Copied</Text>
                      </View>
                    ) : (
                      <Icon name="content-copy" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.walletInfoValue}>{wallet.privateKey}</Text>
              </View>

              <View style={styles.warningCard}>
                <Icon name="warning" size={24} color="#ff9500" />
                <Text style={styles.warningText}>
                  <Text style={styles.warningTextBold}>IMPORTANT:</Text> Store
                  your seed phrase and private key securely! Anyone with access
                  to these can control your funds. Never share them online or
                  with untrusted parties.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.proceedButton}
                onPress={proceedToWallet}
              >
                <Text style={styles.buttonText}>
                  I&apos;ve Saved My Keys - Continue
                </Text>
                <Icon name="arrow-forward" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateWalletScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 5,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 4,
    minWidth: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  placeholder: {
    width: 32,
  },
  body: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 17,
    color: "#000",
    textAlign: "center",
    marginTop: 0,
    marginBottom: 10,
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 10,
    textAlign: "center",
  },
  loadingSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  progressBar: {
    width: "80%",
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  loadingStepsContainer: {
    alignItems: "flex-start",
    width: "100%",
  },
  loadingStepItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  loadingStepText: {
    fontSize: 14,
    marginLeft: 12,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: "#007affff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    width: "100%",
    maxWidth: 280,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  successContainer: {
    alignItems: "center",
    width: "100%",
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#34C759",
    marginBottom: 30,
    textAlign: "center",
  },
  walletInfoCard: {
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 12,
    marginBottom: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  walletInfoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  copyButton: {
    padding: 4,
    minHeight: 32,
    minWidth: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  copiedIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  copiedText: {
    fontSize: 12,
    color: "#007affff",
    fontWeight: "600",
    marginLeft: 4,
  },
  walletInfoValue: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#333",
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 8,
    lineHeight: 18,
  },
  mnemonicContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  mnemonicWord: {
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    width: "31%", // Ensures 3 words per row with equal spacing
    marginBottom: 8,
    justifyContent: "flex-start",
  },
  mnemonicIndex: {
    fontSize: 10,
    color: "#007AFF",
    fontWeight: "600",
    marginRight: 6,
    minWidth: 18,
    textAlign: "center",
  },
  mnemonicText: {
    fontSize: 12,
    color: "#333",
    fontFamily: "monospace",
    flex: 1,
  },
  warningCard: {
    backgroundColor: "#fff3cd",
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    borderLeftWidth: 4,
    borderLeftColor: "#ff9500",
  },
  warningText: {
    flex: 1,
    fontSize: 15,
    color: "#856404",
    marginLeft: 12,
    lineHeight: 20,
  },
  warningTextBold: {
    fontWeight: "bold",
  },
  proceedButton: {
    backgroundColor: "#007affff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    width: "100%",
    maxWidth: 320,
  },
});
