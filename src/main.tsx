import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AppLayout } from "./ui/AppLayout";
import { ProtectedLayout } from "./ui/ProtectedLayout";
import { ActivationPage } from "./pages/ActivationPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InventoryPage } from "./pages/InventoryPage";
import { AddItemPage } from "./pages/AddItemPage";
import { SalesPage } from "./pages/SalesPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { StatsPage } from "./pages/StatsPage";
import { TaxSummaryPage } from "./pages/TaxSummaryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { useActivationStore } from "./store/useActivationStore";
import { useAppStore } from "./store/useAppStore";
import "./styles.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "inventory", element: <InventoryPage /> },
          { path: "add-item", element: <AddItemPage /> },
          { path: "sales", element: <SalesPage /> },
          { path: "expenses", element: <ExpensesPage /> },
          { path: "statistics", element: <StatsPage /> },
          { path: "tax-summary", element: <TaxSummaryPage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    path: "/activate",
    element: <ActivationPage />,
  },
]);

function AppRouter() {
  const hydrate = useActivationStore((state) => state.hydrate);
  const hydrateApp = useAppStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
    hydrateApp();
  }, [hydrate, hydrateApp]);

  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
);
