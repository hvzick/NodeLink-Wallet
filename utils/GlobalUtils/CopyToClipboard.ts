// utils/GlobalUtils/CopyToClipboard.ts
import * as Clipboard from "expo-clipboard";
import { Alert } from "react-native";

export const copyToClipboard = async (text: string) => {
  try {
    await Clipboard.setStringAsync(text);
  } catch (error) {
    console.error("Failed to copy:", error);
    Alert.alert("Error", "Failed to copy to clipboard");
  }
};
