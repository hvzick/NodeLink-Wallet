/* eslint-disable @typescript-eslint/no-unused-vars */
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Keychain from "react-native-keychain";

export const WALLET_KEYS = [
  "walletAddress",
  "walletPrivateKey",
  "walletMnemonic",
  "walletBalance",
  "walletTokens",
  "walletTransactions",
  "walletNetwork",
];

// Safe keychain operations with error handling
const safeKeychainReset = async (): Promise<void> => {
  try {
    // Fix: resetInternetCredentials takes server parameter, not options
    await Keychain.resetInternetCredentials({ server: "walletPrivateKey" });
  } catch (error1) {
    try {
      // Fallback to resetGenericPassword
      await Keychain.resetGenericPassword();
    } catch (error2) {
      try {
        // Fallback to resetGenericPassword with service
        await Keychain.resetGenericPassword({ service: "walletPrivateKey" });
      } catch (error3) {
        // If all keychain methods fail, just log and continue
        console.log("⚠️ Keychain not available or already empty:", error3);
        // Don't throw error - app should continue to work without keychain
      }
    }
  }
};

const safeKeychainSet = async (
  username: string,
  password: string
): Promise<void> => {
  try {
    await Keychain.setInternetCredentials(
      "walletPrivateKey",
      username,
      password
    );
  } catch (error1) {
    try {
      // Fallback to setGenericPassword
      await Keychain.setGenericPassword(username, password, {
        service: "walletPrivateKey",
      });
    } catch (error2) {
      try {
        // Final fallback - store in AsyncStorage (less secure but functional)
        console.warn("⚠️ Keychain not available, falling back to AsyncStorage");
        await AsyncStorage.setItem("walletPrivateKey_fallback", password);
      } catch (error3) {
        console.error("❌ All storage methods failed:", error3);
        throw new Error("Failed to store wallet data securely");
      }
    }
  }
};

const safeKeychainGet = async (): Promise<{
  username: string;
  password: string;
} | null> => {
  try {
    const credentials = await Keychain.getInternetCredentials(
      "walletPrivateKey"
    );
    return credentials && credentials.password ? credentials : null;
  } catch (error1) {
    try {
      // Fallback to getGenericPassword
      const credentials = await Keychain.getGenericPassword({
        service: "walletPrivateKey",
      });
      return credentials && credentials.password ? credentials : null;
    } catch (error2) {
      try {
        // Check AsyncStorage fallback
        const password = await AsyncStorage.getItem(
          "walletPrivateKey_fallback"
        );
        return password ? { username: "fallback", password } : null;
      } catch (error3) {
        console.log("⚠️ No stored credentials found");
        return null;
      }
    }
  }
};

export const clearWalletData = async (): Promise<void> => {
  try {
    // Clear AsyncStorage data
    await AsyncStorage.multiRemove(WALLET_KEYS);

    // Clear keychain data safely
    await safeKeychainReset();

    // Clear fallback storage if exists
    await AsyncStorage.removeItem("walletPrivateKey_fallback");

    console.log("✅ Wallet data cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing wallet data:", error);
    throw error;
  }
};

export const clearWalletDataOnReload = async (): Promise<void> => {
  if (!__DEV__) return;

  try {
    console.log("🧹 AUTO-CLEARING wallet data for testing...");
    await clearWalletData();
    console.log("✅ Wallet data auto-cleared for testing");
  } catch (error) {
    console.error("❌ Error auto-clearing wallet data:", error);
    // Don't throw error in dev mode - let app continue
  }
};

export const getStoredWalletAddress = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("walletAddress");
  } catch (error) {
    console.error("Error getting stored wallet address:", error);
    return null;
  }
};

export const storeWalletData = async (
  address: string,
  privateKey: string
): Promise<void> => {
  try {
    // Store address in AsyncStorage
    await AsyncStorage.setItem("walletAddress", address);

    // Store private key securely
    await safeKeychainSet(address, privateKey);

    console.log("✅ Wallet data stored successfully");
  } catch (error) {
    console.error("❌ Error storing wallet data:", error);
    throw error;
  }
};

export const getStoredPrivateKey = async (): Promise<string | null> => {
  try {
    const credentials = await safeKeychainGet();
    return credentials?.password || null;
  } catch (error) {
    console.error("Error getting stored private key:", error);
    return null;
  }
};

// Debug function to clear all app data
export const debugClearAllData = async (): Promise<void> => {
  try {
    console.log("=== DEBUG: Clearing all app data ===");

    // Get all AsyncStorage keys for logging
    const keys = await AsyncStorage.getAllKeys();
    console.log("Keys to clear:", keys);

    // Clear all AsyncStorage
    await AsyncStorage.clear();

    // Clear keychain safely
    await safeKeychainReset();

    console.log("=== DEBUG: All data cleared successfully ===");
  } catch (error) {
    console.error("❌ Debug clear error:", error);
    throw error;
  }
};
