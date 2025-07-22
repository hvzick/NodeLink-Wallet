import { ethers } from "ethers";
import { Alert } from "react-native";

export const validatePrivateKey = (privateKey: string): boolean => {
  return privateKey.startsWith("0x") && privateKey.length === 66;
};

export const validateSeedPhrase = (seedPhrase: string): boolean => {
  const words = seedPhrase.trim().split(" ");
  return words.length >= 12 && words.length <= 24;
};

export const createWalletFromPrivateKey = (
  privateKey: string
): ethers.Wallet => {
  if (!validatePrivateKey(privateKey)) {
    throw new Error(
      "Private key must start with '0x' and be 64 characters long"
    );
  }
  return new ethers.Wallet(privateKey.trim());
};

export const createWalletFromSeedPhrase = (
  seedPhrase: string
): ethers.Wallet => {
  const trimmedPhrase = seedPhrase.trim();
  if (!validateSeedPhrase(trimmedPhrase)) {
    throw new Error("Seed phrase must be between 12-24 words");
  }
  return ethers.Wallet.fromMnemonic(trimmedPhrase);
};

export const showSuccessAlert = (
  title: string,
  message: string,
  onPress?: () => void
): void => {
  Alert.alert(title, message, [{ text: "OK", onPress }]);
};

export const showErrorAlert = (message: string): void => {
  Alert.alert("Error", message);
};
