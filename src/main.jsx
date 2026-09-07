// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.jsx";
import { store } from "./app/store";
import "./index.css";
import "./i18n";

// ✅ Correct imports for Ant Design v5+
import 'antd/dist/reset.css';

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </StrictMode>
);