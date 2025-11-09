import { useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { VWConnectApp } from "./components/VWConnectApp";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/sonner";

type Screen = "login" | "dashboard";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");

  const handleAuthenticate = () => {
    setCurrentScreen("dashboard");
  };

  const handleLogout = () => {
    setCurrentScreen("login");
  };

  return (
    <ThemeProvider>
      {currentScreen === "login" && (
        <LoginScreen onAuthenticate={handleAuthenticate} />
      )}
      {currentScreen === "dashboard" && (
        <VWConnectApp onLogout={handleLogout} />
      )}
      <Toaster position="top-center" />
    </ThemeProvider>
  );
}
