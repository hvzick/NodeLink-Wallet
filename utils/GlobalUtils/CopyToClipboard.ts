// utils/GlobalUtils/CopyToClipboard.ts
import { Alert } from "react-native";
import * as Clipboard from "expo-clipboard";

export const copyToClipboard = async (text: string) => {
  try {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied!", "Text copied to clipboard");
  } catch (error) {
    console.error("Failed to copy:", error);
    Alert.alert("Error", "Failed to copy to clipboard");
  }
};
