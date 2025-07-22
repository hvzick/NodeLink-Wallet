// screens/Wallet/components/ExportPrivateKey.tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { copyToClipboard } from "../../../../utils/GlobalUtils/CopyToClipboard";
import { useThemeToggle } from "../../../../utils/GlobalUtils/ThemeProvider";
import { getStoredPrivateKey } from "../../../../utils/WalletUtils/walletStorage";

interface ExportPrivateKeyProps {
  visible: boolean;
  onClose: () => void;
  walletAddress?: string;
}

export const ExportPrivateKey: React.FC<ExportPrivateKeyProps> = ({
  visible,
  onClose,
  walletAddress,
}) => {
  const { currentTheme } = useThemeToggle();
  const isDarkMode = currentTheme === "dark";

  const [step, setStep] = useState<"warning" | "password" | "display">(
    "warning"
  );
  const [password, setPassword] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [securityChecks, setSecurityChecks] = useState({
    understood: false,
    responsibility: false,
    noScreenshot: false,
  });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible) {
      setStep("warning");
      setPassword("");
      setPrivateKey("");
      setShowPrivateKey(false);
      setShowCopied(false);
      setSecurityChecks({
        understood: false,
        responsibility: false,
        noScreenshot: false,
      });
    }
  }, [visible]);

  const allSecurityChecksComplete =
    Object.values(securityChecks).every(Boolean);

  const handleSecurityCheckChange = (key: keyof typeof securityChecks) => {
    setSecurityChecks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const proceedToPasswordStep = () => {
    if (!allSecurityChecksComplete) {
      Alert.alert(
        "Security Check",
        "Please confirm all security requirements before proceeding."
      );
      return;
    }
    setStep("password");
  };

  const validatePassword = async () => {
    if (!password.trim()) {
      Alert.alert("Error", "Please enter your wallet password");
      return;
    }
    setLoading(true);
    try {
      // Simulate password validation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const storedPrivateKey = await getStoredPrivateKey();
      if (!storedPrivateKey) {
        throw new Error("Private key not found");
      }
      setPrivateKey(storedPrivateKey);
      setStep("display");
    } catch (error) {
      console.error("Error retrieving private key:", error);
      Alert.alert(
        "Error",
        "Failed to retrieve private key. Please check your password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPrivateKey = async () => {
    if (privateKey) {
      await copyToClipboard(privateKey);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 3000);
    }
  };

  const handleClose = () => {
    Alert.alert(
      "Close Export",
      "Are you sure you want to close? Make sure you have safely stored your private key.",
      [
        { text: "Stay Here", style: "cancel" },
        {
          text: "Close",
          style: "destructive",
          onPress: () => {
            setPrivateKey("");
            onClose();
          },
        },
      ]
    );
  };

  if (!visible) return null;

  const styles = getStyles(isDarkMode);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* HEADER: iOS style, close left, large & centered heading */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Icon name="close" size={24} color="#FF3B30" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer} pointerEvents="none">
            <Text style={styles.headerTitleText}>Export Private Key</Text>
          </View>
          <View style={{ width: 40 }} /> {/* right placeholder for symmetry */}
        </View>

        <View style={styles.content}>
          {/* -- rest of modal unchanged ... */}
          {step === "warning" && (
            <View style={styles.stepContainer}>
              <View style={styles.warningIconContainer}>
                <Icon name="warning" size={60} color="#FF3B30" />
              </View>
              <Text style={styles.stepTitle}>Security Warning</Text>
              <Text style={styles.warningText}>
                Your private key controls your funds. Anyone with access to it
                can steal your cryptocurrency.
              </Text>
              <View style={styles.checklistContainer}>
                <Text style={styles.checklistTitle}>
                  Before proceeding, confirm:
                </Text>
                <TouchableOpacity
                  style={styles.checkboxItem}
                  onPress={() => handleSecurityCheckChange("understood")}
                >
                  <Icon
                    name={
                      securityChecks.understood
                        ? "check-box"
                        : "check-box-outline-blank"
                    }
                    size={24}
                    color={securityChecks.understood ? "#007AFF" : "#999"}
                  />
                  <Text style={styles.checkboxText}>
                    I understand that my private key gives complete control over
                    my funds
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.checkboxItem}
                  onPress={() => handleSecurityCheckChange("responsibility")}
                >
                  <Icon
                    name={
                      securityChecks.responsibility
                        ? "check-box"
                        : "check-box-outline-blank"
                    }
                    size={24}
                    color={securityChecks.responsibility ? "#007AFF" : "#999"}
                  />
                  <Text style={styles.checkboxText}>
                    I take full responsibility for keeping my private key secure
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.checkboxItem}
                  onPress={() => handleSecurityCheckChange("noScreenshot")}
                >
                  <Icon
                    name={
                      securityChecks.noScreenshot
                        ? "check-box"
                        : "check-box-outline-blank"
                    }
                    size={24}
                    color={securityChecks.noScreenshot ? "#007AFF" : "#999"}
                  />
                  <Text style={styles.checkboxText}>
                    I will not take screenshots or share this key with anyone
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[
                  styles.proceedButton,
                  !allSecurityChecksComplete && styles.proceedButtonDisabled,
                ]}
                onPress={proceedToPasswordStep}
                disabled={!allSecurityChecksComplete}
              >
                <Text
                  style={[
                    styles.proceedButtonText,
                    !allSecurityChecksComplete &&
                      styles.proceedButtonTextDisabled,
                  ]}
                >
                  I Understand, Continue
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === "password" && (
            <View style={styles.stepContainer}>
              <View style={styles.passwordIconContainer}>
                <Icon name="lock" size={60} color="#007AFF" />
              </View>
              <Text style={styles.stepTitle}>Enter Password</Text>
              <Text style={styles.stepDescription}>
                Please enter your wallet password to decrypt and view your
                private key.
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your wallet password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <TouchableOpacity
                style={styles.validateButton}
                onPress={validatePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.validateButtonText}>
                    Decrypt Private Key
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {step === "display" && (
            <View style={styles.stepContainer}>
              <View style={styles.keyIconContainer}>
                <Icon name="vpn-key" size={60} color="#34C759" />
              </View>
              <Text style={styles.stepTitle}>Your Private Key</Text>
              <Text style={styles.stepDescription}>
                Store this key in a safe place. Never share it with anyone.
              </Text>
              {walletAddress && (
                <View style={styles.addressInfo}>
                  <Text style={styles.addressLabel}>Wallet Address:</Text>
                  <Text
                    style={styles.addressText}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {walletAddress}
                  </Text>
                </View>
              )}
              <View style={styles.privateKeyContainer}>
                <View style={styles.privateKeyHeader}>
                  <Text style={styles.privateKeyLabel}>Private Key:</Text>
                  <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => setShowPrivateKey(!showPrivateKey)}
                  >
                    <Icon
                      name={showPrivateKey ? "visibility-off" : "visibility"}
                      size={20}
                      color="#007AFF"
                    />
                    <Text style={styles.toggleButtonText}>
                      {showPrivateKey ? "Hide" : "Show"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.privateKeyBox}>
                  {showPrivateKey ? (
                    <Text style={styles.privateKeyText} selectable>
                      {privateKey}
                    </Text>
                  ) : (
                    <Text style={styles.hiddenKeyText}>
                      ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={handleCopyPrivateKey}
                >
                  <Icon
                    name={showCopied ? "check" : "content-copy"}
                    size={20}
                    color="#007AFF"
                  />
                  <Text style={styles.copyButtonText}>
                    {showCopied ? "Copied!" : "Copy Private Key"}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.securityReminder}>
                <Icon name="security" size={24} color="#FF9500" />
                <View style={styles.reminderContent}>
                  <Text style={styles.reminderTitle}>Security Reminder:</Text>
                  <Text style={styles.reminderText}>
                    • Store this key offline in a secure location{"\n"}• Never
                    enter it on suspicious websites{"\n"}• Don&apos;t save it in
                    cloud storage or photos{"\n"}• Consider using a hardware
                    wallet for large amounts
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Header style adapted from AppearanceScreen with red close icon
const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#1C1C1D" : "#F2F2F2",
    },
    headerRow: {
      position: "relative",
      flexDirection: "row",
      alignItems: "center",
      height: 40,
      paddingHorizontal: 16,
      backgroundColor: isDarkMode ? "#1C1C1D" : "#F2F2F2",
      borderBottomWidth: 0,
    },
    closeButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 20,
      backgroundColor: "rgba(255,59,48,0.1)",
    },
    headerTitleContainer: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitleText: {
      fontSize: 20,
      fontWeight: "600",
      color: isDarkMode ? "#fff" : "#333333",
      fontFamily: "SF-Pro-Text-Medium",
    },

    // ... rest of unchanged styles below ...
    content: {
      flexGrow: 1,
      padding: 20,
    },
    stepContainer: {
      flex: 1,
      alignItems: "center",
    },
    warningIconContainer: {
      marginBottom: 24,
    },
    stepTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: isDarkMode ? "#fff" : "#1F2937",
      marginBottom: 16,
      textAlign: "center",
    },
    warningText: {
      fontSize: 16,
      color: "#6B7280",
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 32,
      paddingHorizontal: 20,
    },
    // ... (leave rest unchanged from your previous styles)
    checklistContainer: {
      width: "100%",
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      padding: 20,
      marginBottom: 32,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    checklistTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1F2937",
      marginBottom: 16,
    },
    checkboxItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    checkboxText: {
      flex: 1,
      fontSize: 14,
      color: "#374151",
      lineHeight: 20,
      marginLeft: 12,
    },
    proceedButton: {
      backgroundColor: "#007AFF",
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 12,
      width: "100%",
      maxWidth: 300,
    },
    proceedButtonDisabled: {
      backgroundColor: "#D1D5DB",
    },
    proceedButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
    },
    proceedButtonTextDisabled: {
      color: "#9CA3AF",
    },
    passwordIconContainer: {
      marginBottom: 24,
    },
    stepDescription: {
      fontSize: 16,
      color: "#6B7280",
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 32,
      paddingHorizontal: 20,
    },
    inputContainer: {
      width: "100%",
      marginBottom: 32,
    },
    passwordInput: {
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    validateButton: {
      backgroundColor: "#007AFF",
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 12,
      width: "100%",
      maxWidth: 300,
      minHeight: 52,
      justifyContent: "center",
      alignItems: "center",
    },
    validateButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    keyIconContainer: {
      marginBottom: 24,
    },
    addressInfo: {
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      padding: 16,
      width: "100%",
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    addressLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: "#6B7280",
      marginBottom: 8,
    },
    addressText: {
      fontSize: 14,
      fontFamily: "monospace",
      color: "#374151",
    },
    privateKeyContainer: {
      width: "100%",
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    privateKeyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    privateKeyLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1F2937",
    },
    toggleButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    toggleButtonText: {
      fontSize: 14,
      color: "#007AFF",
      fontWeight: "500",
      marginLeft: 4,
    },
    privateKeyBox: {
      backgroundColor: "#F9FAFB",
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: "#E5E7EB",
    },
    privateKeyText: {
      fontSize: 12,
      fontFamily: "monospace",
      color: "#374151",
      lineHeight: 16,
    },
    hiddenKeyText: {
      fontSize: 14,
      color: "#9CA3AF",
      textAlign: "center",
    },
    copyButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: "rgba(0, 122, 255, 0.1)",
      borderRadius: 8,
    },
    copyButtonText: {
      fontSize: 14,
      color: "#007AFF",
      fontWeight: "600",
      marginLeft: 8,
    },
    securityReminder: {
      flexDirection: "row",
      backgroundColor: "#FEF3C7",
      borderRadius: 12,
      padding: 16,
      marginBottom: 32,
      borderLeftWidth: 4,
      borderLeftColor: "#F59E0B",
      width: "100%",
    },
    reminderContent: {
      flex: 1,
      marginLeft: 12,
    },
    reminderTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: "#92400E",
      marginBottom: 8,
    },
    reminderText: {
      fontSize: 13,
      color: "#92400E",
      lineHeight: 18,
    },
  });
