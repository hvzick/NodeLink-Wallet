import React, { useEffect, useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import QRCode from "react-native-qrcode-svg";
import { runOnJS } from "react-native-reanimated";
import Icon from "react-native-vector-icons/MaterialIcons";
import { copyToClipboard } from "../../../../utils/GlobalUtils/CopyToClipboard";

interface ReceiveScreenProps {
  address: string;
  selectedNetwork: string;
  onBack: () => void;
}

interface NetworkInfo {
  id: string;
  name: string;
  symbol: string;
  color: string;
  icon: string;
}

const networks: Record<string, NetworkInfo> = {
  ethereum: {
    id: "ethereum",
    name: "Ethereum Mainnet",
    symbol: "ETH",
    color: "#627EEA",
    icon: "account-balance-wallet",
  },
  sepolia: {
    id: "sepolia",
    name: "Sepolia Testnet",
    symbol: "ETH",
    color: "#FF6B6B",
    icon: "bug-report",
  },
};

export default function ReceiveScreen({
  address,
  selectedNetwork,
  onBack,
}: ReceiveScreenProps) {
  const [showCopied, setShowCopied] = useState(false);
  const [qrSize, setQrSize] = useState(200);

  const currentNetwork = networks[selectedNetwork] || networks.ethereum;

  useEffect(() => {
    // Adjust QR code size based on screen width
    const { width } = Dimensions.get("window");
    const calculatedSize = Math.min(width * 0.6, 250);
    setQrSize(calculatedSize);
  }, []);

  const handleCopyAddress = async () => {
    await copyToClipboard(address);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleShareAddress = async () => {
    try {
      await Share.share({
        message: `My ${currentNetwork.name} wallet address:\n${address}`,
        title: "My Wallet Address",
      });
    } catch (error) {
      console.error("Error sharing address:", error);
    }
  };

  // New gesture handler for swipe-to-go-back
  const panGesture = Gesture.Pan().onEnd((event) => {
    // Only trigger if swipe is mostly horizontal and rightwards
    if (event.translationX > 80 && Math.abs(event.translationY) < 50) {
      runOnJS(onBack)();
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <View style={{ flex: 1 }}>
          {/* Fixed Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Icon name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Receive {currentNetwork.symbol}</Text>
            <View style={styles.placeholder} />
          </View>

          {/* GestureDetector wraps a View, not ScrollView */}
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {/* Network Badge */}
            <View style={styles.networkBadge}>
              <Icon
                name={currentNetwork.icon}
                size={20}
                color={currentNetwork.color}
              />
              <Text
                style={[styles.networkText, { color: currentNetwork.color }]}
              >
                {currentNetwork.name}
              </Text>
            </View>

            {/* QR Code Section */}
            <View style={styles.qrSection}>
              <Text style={styles.qrTitle}>Scan QR Code</Text>
              <Text style={styles.qrSubtitle}>
                Have the sender scan this QR code to send you{" "}
                {currentNetwork.symbol}
              </Text>

              <View style={styles.qrContainer}>
                <QRCode
                  value={address}
                  size={qrSize}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                  logoSize={30}
                  logoBackgroundColor="transparent"
                />
              </View>
            </View>

            {/* Address Section */}
            <View style={styles.addressSection}>
              <Text style={styles.addressTitle}>Wallet Address</Text>
              <View style={styles.addressCard}>
                <Text style={styles.addressFull}>{address}</Text>
                <View style={styles.addressActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleCopyAddress}
                  >
                    <Icon
                      name={showCopied ? "check" : "content-copy"}
                      size={20}
                      color="#007AFF"
                    />
                    <Text style={styles.actionButtonText}>
                      {showCopied ? "Copied!" : "Copy"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleShareAddress}
                  >
                    <Icon name="share" size={20} color="#007AFF" />
                    <Text style={styles.actionButtonText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Warning Section */}
            <View style={styles.warningSection}>
              <Icon name="info" size={20} color="#FF9500" />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Important Notes:</Text>
                <Text style={styles.warningText}>
                  • Only send {currentNetwork.symbol} and {currentNetwork.name}{" "}
                  tokens to this address{"\n"}• Sending other cryptocurrencies
                  may result in permanent loss{"\n"}• Double-check the network
                  before sending funds
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </GestureDetector>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  placeholder: {
    width: 40,
  },
  networkBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  networkText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  qrSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  qrTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  qrSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  qrContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  addressSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  addressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressFull: {
    fontSize: 14,
    fontFamily: "monospace",
    color: "#374151",
    lineHeight: 20,
    marginBottom: 16,
    textAlign: "center",
  },
  addressActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
    marginLeft: 6,
  },
  warningSection: {
    flexDirection: "row",
    backgroundColor: "#FEF3C7",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: "#007AFF",
  },
});
