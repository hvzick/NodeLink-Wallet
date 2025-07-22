import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { storeWalletData } from "../../../../utils/WalletUtils/walletStorage";
import {
  createWalletFromPrivateKey,
  createWalletFromSeedPhrase,
} from "../../../../utils/WalletUtils/walletUtils";

interface ImportWalletScreenProps {
  onWalletImported: () => void;
  onBack: () => void;
}

export default function ImportWalletScreen({
  onWalletImported,
  onBack,
}: ImportWalletScreenProps) {
  const [importMethod, setImportMethod] = useState<"privateKey" | "seedPhrase">(
    "privateKey"
  );
  const [privateKeyInput, setPrivateKeyInput] = useState<string>("");
  const [seedPhraseInput, setSeedPhraseInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loadingStep, setLoadingStep] = useState<number>(0);

  const importWallet = async () => {
    const inputValue =
      importMethod === "privateKey"
        ? privateKeyInput.trim()
        : seedPhraseInput.trim();

    // Clear previous errors
    setErrorMessage("");

    if (!inputValue) {
      setErrorMessage(
        `Please enter a ${
          importMethod === "privateKey" ? "private key" : "seed phrase"
        }`
      );
      return;
    }

    setLoading(true);
    setLoadingStep(1);

    try {
      // Step 1: Validating credentials
      await new Promise((resolve) => setTimeout(resolve, 800));
      setLoadingStep(2);

      // Step 2: Creating wallet instance
      const wallet =
        importMethod === "privateKey"
          ? createWalletFromPrivateKey(inputValue)
          : createWalletFromSeedPhrase(inputValue);

      await new Promise((resolve) => setTimeout(resolve, 600));
      setLoadingStep(3);

      // Step 3: Securing data
      await storeWalletData(wallet.address, wallet.privateKey);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLoadingStep(4);

      // Step 4: Complete - redirect immediately
      onWalletImported();
    } catch (error: any) {
      setLoading(false);
      setLoadingStep(0);

      // Set custom error message based on error type
      if (error.message.toLowerCase().includes("private key")) {
        setErrorMessage(
          "Invalid private key format. Please check and try again."
        );
      } else if (
        error.message.toLowerCase().includes("mnemonic") ||
        error.message.toLowerCase().includes("seed")
      ) {
        setErrorMessage(
          "Invalid seed phrase. Please check your words and try again."
        );
      } else if (
        error.message.toLowerCase().includes("12") ||
        error.message.toLowerCase().includes("24")
      ) {
        setErrorMessage("Seed phrase must be 12 or 24 words long.");
      } else {
        setErrorMessage(
          "Invalid credentials. Please check your input and try again."
        );
      }
    }
  };

  const isInputValid = () => {
    return importMethod === "privateKey"
      ? privateKeyInput.trim().length > 0
      : seedPhraseInput.trim().length > 0;
  };

  // Enhanced Loading Screen with Blue Theme
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.loadingIconContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>

          <Text style={styles.loadingTitle}>Importing Wallet</Text>
          <Text style={styles.loadingSubtitle}>
            Please wait while we securely import your wallet...
          </Text>

          <View style={styles.loadingSteps}>
            {/* Step 1: Validating credentials */}
            <View style={styles.stepItem}>
              {loadingStep >= 1 ? (
                <Icon name="check-circle" size={20} color="#007AFF" />
              ) : (
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
              )}
              <Text
                style={[
                  styles.stepText,
                  { color: loadingStep >= 1 ? "#007AFF" : "#999" },
                ]}
              >
                Validating credentials
              </Text>
            </View>

            {/* Step 2: Creating wallet instance */}
            <View style={styles.stepItem}>
              {loadingStep >= 3 ? (
                <Icon name="check-circle" size={20} color="#007AFF" />
              ) : loadingStep === 2 ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
              )}
              <Text
                style={[
                  styles.stepText,
                  { color: loadingStep >= 2 ? "#007AFF" : "#999" },
                ]}
              >
                Creating wallet instance
              </Text>
            </View>

            {/* Step 3: Securing data */}
            <View style={styles.stepItem}>
              {loadingStep >= 4 ? (
                <Icon name="check-circle" size={20} color="#007AFF" />
              ) : loadingStep === 3 ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
              )}
              <Text
                style={[
                  styles.stepText,
                  { color: loadingStep >= 3 ? "#007AFF" : "#999" },
                ]}
              >
                Securing wallet data
              </Text>
            </View>

            {/* Step 4: Finalizing */}
            <View style={styles.stepItem}>
              {loadingStep >= 4 ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
              )}
              <Text
                style={[
                  styles.stepText,
                  { color: loadingStep >= 4 ? "#007AFF" : "#999" },
                ]}
              >
                {loadingStep >= 4
                  ? "Redirecting to wallet..."
                  : "Finalizing setup"}
              </Text>
            </View>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(loadingStep / 4) * 100}%` },
              ]}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Icon name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Import Wallet</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.body}>
          <Icon name="file-download" size={80} color="#34C759" />
          <Text style={styles.subtitle}>
            Import your existing wallet using private key or seed phrase
          </Text>

          {/* Error Banner */}
          {errorMessage !== "" && (
            <View style={styles.errorBanner}>
              <Icon name="error" size={20} color="#FF3B30" />
              <Text style={styles.errorText}>{errorMessage}</Text>
              <TouchableOpacity onPress={() => setErrorMessage("")}>
                <Icon name="close" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}

          {/* Import Method Selector */}
          <View style={styles.methodSelector}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                importMethod === "privateKey" && styles.methodButtonActive,
              ]}
              onPress={() => {
                setImportMethod("privateKey");
                setErrorMessage("");
              }}
            >
              <Text
                style={[
                  styles.methodButtonText,
                  importMethod === "privateKey" &&
                    styles.methodButtonTextActive,
                ]}
              >
                Private Key
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.methodButton,
                importMethod === "seedPhrase" && styles.methodButtonActive,
              ]}
              onPress={() => {
                setImportMethod("seedPhrase");
                setErrorMessage("");
              }}
            >
              <Text
                style={[
                  styles.methodButtonText,
                  importMethod === "seedPhrase" &&
                    styles.methodButtonTextActive,
                ]}
              >
                Seed Phrase
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Section */}
          {importMethod === "privateKey" ? (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Private Key</Text>
              <TextInput
                style={[
                  styles.textInput,
                  errorMessage !== "" && styles.inputError,
                ]}
                value={privateKeyInput}
                onChangeText={(text) => {
                  setPrivateKeyInput(text);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="0x..."
                multiline
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
              <Text style={styles.inputHint}>
                Enter your 64-character private key (starts with 0x)
              </Text>
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Seed Phrase</Text>
              <TextInput
                style={[
                  styles.textInput,
                  errorMessage !== "" && styles.inputError,
                ]}
                value={seedPhraseInput}
                onChangeText={(text) => {
                  setSeedPhraseInput(text);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="word1 word2 word3 ..."
                multiline
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.inputHint}>
                Enter your 12-24 word seed phrase separated by spaces
              </Text>
            </View>
          )}

          {/* Security Warning */}
          <View style={styles.warningCard}>
            <Icon name="security" size={24} color="#FF9500" />
            <Text style={styles.warningText}>
              Never share your private key or seed phrase with anyone. We store
              it securely on your device using encrypted storage.
            </Text>
          </View>

          {/* Import Button */}
          <TouchableOpacity
            style={[
              styles.importButton,
              { opacity: !isInputValid() ? 0.5 : 1 },
            ]}
            onPress={importWallet}
            disabled={!isInputValid()}
          >
            <Icon name="file-download" size={24} color="#ffffff" />
            <Text style={styles.buttonText}>Import Wallet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 4,
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
    padding: 20,
    alignItems: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 30,
    lineHeight: 22,
  },

  // Error Banner Styles
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: "100%",
    borderLeftWidth: 4,
    borderLeftColor: "#FF3B30",
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#c62828",
    marginLeft: 8,
    fontWeight: "500",
  },

  // Enhanced Loading Screen Styles with Blue Theme
  loadingContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
    padding: 40,
    width: "100%",
    maxWidth: 350,
  },
  loadingIconContainer: {
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
  },
  loadingSteps: {
    width: "100%",
    marginBottom: 30,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 4,
  },
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  stepText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "500",
    flex: 1,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF", // Changed from green to blue
    borderRadius: 2,
  },

  methodSelector: {
    flexDirection: "row",
    marginBottom: 30,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 4,
    width: "100%",
  },
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  methodButtonActive: {
    backgroundColor: "#007AFF",
  },
  methodButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  methodButtonTextActive: {
    color: "#ffffff",
  },
  inputContainer: {
    marginBottom: 20,
    width: "100%",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  textInput: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontFamily: "monospace",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputError: {
    borderColor: "#FF3B30",
    borderWidth: 2,
  },
  inputHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    fontStyle: "italic",
  },
  warningCard: {
    backgroundColor: "#fff8e1",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 30,
    width: "100%",
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#f57c00",
    marginLeft: 12,
    lineHeight: 20,
  },
  importButton: {
    backgroundColor: "#34C759",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    width: "100%",
    maxWidth: 300,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
