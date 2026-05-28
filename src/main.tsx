import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { useUIStore } from "./stores/uiStore";
import { useProjectStore } from "./stores/projectStore";

const Root = () => {
    const { init: initUI, theme } = useUIStore();
    const { init: initProject } = useProjectStore();

    useEffect(() => {
        initUI();
        initProject();
    }, [initUI, initProject]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else if (theme === 'light') {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    return (
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<Root />);
