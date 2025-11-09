import { useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { VWConnectApp } from "./components/VWConnectApp";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/sonner";
import { useHazardState } from './logic/useHazardState';

type Screen = "login" | "dashboard";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");

  // Initialize hazard state at the app root level
  const hazardState = useHazardState();

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
        <VWConnectApp 
          onLogout={handleLogout}
          hazardState={hazardState}
        />
      )}
      <Toaster 
        position="top-center" 
        theme="dark" 
        richColors 
        closeButton
      />
    </ThemeProvider>
  );
}
