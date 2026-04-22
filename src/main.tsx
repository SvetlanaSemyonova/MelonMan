import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { PortalDataProvider } from "./context/PortalDataContext";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <PortalDataProvider>
        <App />
      </PortalDataProvider>
    </AuthProvider>
  </StrictMode>
);
