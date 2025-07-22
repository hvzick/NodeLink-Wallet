export interface WelcomeScreenProps {
  onNavigateToCreate: () => void;
  onNavigateToImport: () => void;
  onNavigateToWallet: () => void;
}

export interface CreateWalletScreenProps {
  onWalletCreated: () => void;
  onBack: () => void;
}

export interface ImportWalletScreenProps {
  onWalletImported: () => void;
  onBack: () => void;
}

export interface WalletScreenProps {
  onWalletRemoved: () => void;
}

export type AppScreen = "welcome" | "create" | "import" | "wallet";
