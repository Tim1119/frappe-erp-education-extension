import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import App from "./App";
import "./index.css";

const basename = window.location.port === "5173" ? "/" : "/staff-dashboard";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Toaster
            position="bottom-right"
            containerStyle={{ zIndex: 10000 }}
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "8px",
                fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
                fontSize: "13px",
                fontWeight: 500,
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);