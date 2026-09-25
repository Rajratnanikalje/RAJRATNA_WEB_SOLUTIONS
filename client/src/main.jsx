import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import ScrollToTop from "./components/ScrollToTop";
import "./index.css";

class AppErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error)
      return (
        <div
          style={{
            minHeight: "100vh",
            padding: "32px",
            background: "#f8fafc",
            color: "#172033",
            fontFamily: "system-ui",
          }}
        >
          <h1 style={{ fontSize: "24px", margin: 0 }}>Page could not load</h1>
          <p style={{ color: "#475569" }}>
            Please refresh the page. If this remains, copy the error below.
          </p>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              padding: "16px",
              borderRadius: "12px",
              background: "#fee2e2",
              color: "#991b1b",
            }}
          >
            {this.state.error.message}
          </pre>
        </div>
      );
    return this.props.children;
  }
}
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <App />
      </BrowserRouter>
    </AppErrorBoundary>
  </React.StrictMode>,
);
