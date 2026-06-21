
  import { createRoot } from "react-dom/client";
  import App, { AuthProvider } from "./app/App.tsx";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
  