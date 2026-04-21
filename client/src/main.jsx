import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ExitModal } from "@/components/modals/exit-modal";
import { HeartsModal } from "@/components/modals/hearts-modal";
import { PracticeModal } from "@/components/modals/practice-modal";
import { AuthProvider } from "@/context/AuthContext";
import App from "./App";
import "./index.css";
ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Toaster theme="light" richColors closeButton/>
        <ExitModal />
        <HeartsModal />
        <PracticeModal />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>);
