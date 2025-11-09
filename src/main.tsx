
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./styles/globals.css";

  console.log("Main.tsx loaded successfully");
  
  const rootElement = document.getElementById("root");
  console.log("Root element:", rootElement);
  
  if (rootElement) {
    createRoot(rootElement).render(<App />);
    console.log("App rendered successfully");
  } else {
    console.error("Root element not found!");
  }
  