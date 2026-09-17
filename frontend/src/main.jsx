import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./store/store";
import { AppProvider } from "./context/AppContext";
import SessionMonitor from "./components/auth/SessionMonitor";
import App from "./App";
import "./index.css";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppProvider>
        <BrowserRouter>
          <SessionMonitor />
          <App />
          <Toaster position="top-right" />
        </BrowserRouter>
      </AppProvider>
    </Provider>
  </React.StrictMode>,
);
