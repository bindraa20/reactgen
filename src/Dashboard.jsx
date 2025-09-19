// src/Dashboard.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from "react-router-dom";
import PurchaseOrders from "./PurchaseOrder";
import ItemMaster from "./ItemMaster";
import GoodsReceipt from "./GoodsReceipt"; 
function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <>
      <style>{`
        /* Root and resets */
        body, html, #root {
          margin: 0; padding: 0; height: 100%;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          background: linear-gradient(180deg, #f3f8ff 0%, #ffffff 100%);
          color: #1f2937;
        }
        .dashboard-root {
          display: flex;
          height: 100vh;
          overflow: hidden;
        }
        /* Sidebar */
        .sidebar {
          background: linear-gradient(180deg, #3b82f6 0%, #06b6d4 100%);
          color: white;
          width: 260px;
          min-width: 260px;
          display: flex;
          flex-direction: column;
          box-shadow: 3px 0 12px rgba(0,0,0,0.05);
          transition: width 0.3s ease;
          user-select: none;
        }
        .sidebar.collapsed {
          width: 72px;
          min-width: 72px;
        }
        .sidebar-header {
          font-weight: 700;
          font-size: 22px;
          line-height: 1.2;
          padding: 24px 20px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          border-bottom: 1px solid rgba(255 255 255 / 0.15);
          box-shadow: 0 2px 6px rgb(0 0 0 / 0.1);
          color: #e0f2fe;
          display: flex;
          align-items: center;
          justify-content: space-between;
          white-space: nowrap;
        }
        .sidebar-header span {
          flex-grow: 1;
        }
        .sidebar-menu {
          flex-grow: 1;
          padding: 16px 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
        }
        .sidebar-menu a {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          font-weight: 600;
          font-size: 15px;
          color: rgba(255 255 255 / 0.85);
          text-decoration: none;
          border-left: 4px solid transparent;
          transition:
            background-color 0.25s ease,
            border-left-color 0.25s ease,
            color 0.25s ease;
          cursor: pointer;
          white-space: nowrap;
        }
        .sidebar-menu a svg {
          margin-right: 14px;
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          stroke-width: 1.5;
          stroke: currentColor;
        }
        .sidebar-menu a:hover,
        .sidebar-menu a:focus {
          background-color: rgba(255 255 255 / 0.12);
          color: rgba(255 255 255 / 1);
        }
        .sidebar-menu a.active {
          border-left-color: #ebf8ff;
          background-color: rgba(235 248 255 / 0.35);
          color: #ebf8ff;
          font-weight: 700;
          box-shadow: 3px 0 14px #38bdf8cc;
        }

        /* Collapse toggle button */
        .sidebar-toggle {
          cursor: pointer;
          background: transparent;
          border: none;
          color: rgba(255 255 255 / 0.8);
          padding: 8px;
          font-size: 20px;
          transition: transform 0.3s ease, color 0.3s ease;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .sidebar-toggle:hover {
          color: #fff;
        }
        .sidebar-toggle svg {
          width: 22px;
          height: 22px;
          transform: rotate(0deg);
          transition: transform 0.3s ease;
        }
        .sidebar.collapsed .sidebar-toggle svg {
          transform: rotate(180deg);
        }

        /* Main content area */
        .main-content {
          flex-grow: 1;
          overflow-y: auto;
          background: #fff;
          box-shadow: inset 0 0 12px rgb(0 0 0 / 0.03);
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .main-content-header {
          padding: 20px 26px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 22px;
          font-weight: 600;
          color: #374151;
          background: #f9fafb;
          user-select: none;
          box-shadow: inset 0 -1px 0 #e5e7eb;
        }
        .main-content-body {
          flex-grow: 1;
          overflow-y: auto;
          padding: 24px 32px;
          background: #fefefe;
        }

        /* Responsive */
        @media (max-width: 820px) {
          .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 10;
            transform: translateX(0);
            box-shadow: 4px 0 12px rgba(0,0,0,0.12);
            transition: transform 0.25s ease;
          }
          .sidebar.collapsed {
            transform: translateX(-260px);
          }
          .main-content {
            margin-left: 0;
          }
        }
      `}</style>

      <Router>
        <div className="dashboard-root">
          <nav className={`sidebar${sidebarCollapsed ? " collapsed" : ""}`}>
            <div className="sidebar-header">
              <span>{!sidebarCollapsed && "React ERP Gen"}</span>
              <button
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="sidebar-toggle"
                onClick={() => setSidebarCollapsed((v) => !v)}
              >
                {/* Arrow Icon */}
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            <div className="sidebar-menu">
              <NavLink to="/items" className={({ isActive }) => (isActive ? "active" : "")} end>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v-8l8-4 8 4v8a2 2 0 0 1-2 2h-2a4 4 0 0 0-8 0H6a2 2 0 0 1-2-2z" /></svg>
                {!sidebarCollapsed && "Item Master"}
              </NavLink>
              <NavLink to="/purchase-orders" className={({ isActive }) => (isActive ? "active" : "")}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 10h16M10 14h4M5 18h14" /></svg>
                {!sidebarCollapsed && "Purchase Orders"}
              </NavLink>
              <NavLink to="/goods-receipt" className={({ isActive }) => (isActive ? "active" : "")}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 7h18M3 12h18M3 17h18M5 22h14a2 2 0 0 0 2-2v-7H3v7a2 2 0 0 0 2 2z" /></svg>
                {!sidebarCollapsed && "Goods Receipt"}
              </NavLink>
            </div>
          </nav>

          <main className="main-content">
            <header className="main-content-header">
              <Routes>
                <Route path="/" element={<Navigate to="/purchase-orders" replace />} />
                <Route path="/items" element={<PageTitle title="Item Master" />} />
                <Route path="/purchase-orders" element={<PageTitle title="Purchase Orders" />} />
                <Route path="/goods-receipt" element={<PageTitle title="Goods Receipt" />} />
                <Route path="*" element={<PageTitle title="Not Found" />} />
              </Routes>
            </header>
            <section className="main-content-body">
              <Routes>
                <Route path="/" element={<Navigate to="/purchase-orders" replace />} />
                <Route path="/items" element={<ItemMaster />} />
                <Route path="/purchase-orders" element={<PurchaseOrders />} />
                <Route path="/goods-receipt" element={<GoodsReceipt />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </section>
          </main>
        </div>
      </Router>
    </>
  );
}

function GoodsReceiptPage() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Goods Receipt</h2>
      <p>This is the Goods Receipt page. You can add your goods receipt workflows here.</p>
    </div>
  );
}

function PageTitle({ title }) {
  return <>{title}</>;
}

function NotFoundPage() {
  return (
    <div>
      <h2>404 - Page Not Found</h2>
      <p>The requested page does not exist.</p>
    </div>
  );
}

export default Dashboard;