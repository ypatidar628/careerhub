import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./store/store";
import { AppProvider } from "./context/AppContext";
import { SocketProvider } from "./context/SocketContext";
import SessionMonitor from "./components/auth/SessionMonitor";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppProvider>
        <SocketProvider>
          <BrowserRouter>
            <SessionMonitor />
            <App />
            <Toaster position="top-right" />
          </BrowserRouter>
        </SocketProvider>
      </AppProvider>
    </Provider>
  </React.StrictMode>,
);
