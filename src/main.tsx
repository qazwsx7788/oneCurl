import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { useUIStore } from "./stores/uiStore";

const theme = useUIStore.getState().theme;
if (theme === 'dark') {
  document.documentElement.classList.add('dark');
  document.documentElement.classList.remove('light');
} else if (theme === 'light') {
  document.documentElement.classList.add('light');
  document.documentElement.classList.remove('dark');
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
