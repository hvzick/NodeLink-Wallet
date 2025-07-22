import React, { JSX, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "../utils/GlobalUtils/ThemeProvider"; // Import ThemeProvider
import CreateWalletScreen from "./screens/WalletScreen/Screen/CreateWalletScreen";
import ImportWalletScreen from "./screens/WalletScreen/Screen/ImportWalletScreen";
import WalletScreen from "./screens/WalletScreen/Screen/Wallet";
import WelcomeScreen from "./screens/WalletScreen/Screen/WelcomeScreen";

type AppScreen = "welcome" | "create" | "import" | "wallet";

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("welcome");

  const renderCurrentScreen = (): JSX.Element => {
    switch (currentScreen) {
      case "welcome":
        return (
          <WelcomeScreen
            onNavigateToCreate={() => setCurrentScreen("create")}
            onNavigateToImport={() => setCurrentScreen("import")}
            onNavigateToWallet={() => setCurrentScreen("wallet")}
          />
        );
      case "create":
        return (
          <CreateWalletScreen
            onWalletCreated={() => setCurrentScreen("wallet")}
            onBack={() => setCurrentScreen("welcome")}
          />
        );
      case "import":
        return (
          <ImportWalletScreen
            onWalletImported={() => setCurrentScreen("wallet")}
            onBack={() => setCurrentScreen("welcome")}
          />
        );
      case "wallet":
        return (
          <WalletScreen onWalletRemoved={() => setCurrentScreen("welcome")} />
        );
      default:
        return (
          <WelcomeScreen
            onNavigateToCreate={() => setCurrentScreen("create")}
            onNavigateToImport={() => setCurrentScreen("import")}
            onNavigateToWallet={() => setCurrentScreen("wallet")}
          />
        );
    }
  };

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {renderCurrentScreen()}
      </GestureHandlerRootView>
    </ThemeProvider>
  );
};

export default App;
