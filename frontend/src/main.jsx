import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const AppWithProviders = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <AuthProvider>
      <App />
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
    </AuthProvider>
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {GOOGLE_CLIENT_ID ? (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AppWithProviders />
      </GoogleOAuthProvider>
    ) : (
      <AppWithProviders />
    )}
  </React.StrictMode>
);
