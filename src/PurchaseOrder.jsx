import React, { useEffect, useState } from "react";

/*
  PurchaseOrders.jsx
  - Single-file component containing:
    - Outer Grid: list of purchase orders + Create button
    - Purchase Order Form: create/edit PO with item rows and totals
    - Saves to localStorage so data persists between refreshes
    - Responsive and modern UI with CSS included below
*/

const STORAGE_KEY = "purchase_orders_v1";

const sampleVendors = [
  { id: "v-001", name: "Acme Supplies Co." },
  { id: "v-002", name: "Blue Ocean Traders" },
  { id: "v-003", name: "Evergreen Materials" },
];

function formatCurrency(val) {
  return val == null ? "" : "$" + Number(val).toFixed(2);
}

function generatePONumber() {
  // Simple PO number generator: PO-YYYYMMDD-XXXX
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PO-${date}-${rand}`;
}

function calculateLineTotal(item) {
  const qty = Number(item.qty || 0);
  const price = Number(item.price || 0);
  const tax = Number(item.tax || 0);
  const line = qty * price;
  const taxAmount = (tax / 100) * line;
  return line + taxAmount;
}

export default function PurchaseOrders() {
  const [view, setView] = useState("grid"); // 'grid' | 'form'
  const [orders, setOrders] = useState([]);
  const [editingOrderId, setEditingOrderId] = useState(null);

  // Form state
  const defaultItem = () => ({
    id: Date.now() + Math.random(),
    sku: "",
    description: "",
    qty: 1,
    price: 0,
    tax: 0,
  });

  const blankForm = {
    id: null,
    poNumber: generatePONumber(),
    vendorId: sampleVendors[0].id,
    vendorName: sampleVendors[0].name,
    billingAddress: "",
    shippingAddress: "",
    orderDate: new Date().toISOString().slice(0, 10),
    expectedDate: "",
    shippingFee: 0,
    notes: "",
    items: [defaultItem()],
    status: "Draft",
    createdAt: new Date().toISOString(),
  };

  const [form, setForm] = useState(blankForm);
  const [errors, setErrors] = useState({});

  // Load from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setOrders(parsed);
      } catch (e) {
        console.warn("Failed to parse local storage purchase orders", e);
      }
    } else {
      // Optionally populate with a sample order if storage empty
      const sampleOrder = {
        ...blankForm,
        id: "sample-1",
        poNumber: "PO-SAMPLE-0001",
        vendorId: sampleVendors[1].id,
        vendorName: sampleVendors[1].name,
        billingAddress: "123 Sample St, Suite 100",
        shippingAddress: "Warehouse 5, Dock 2",
        orderDate: new Date().toISOString().slice(0, 10),
        expectedDate: "",
        shippingFee: 25,
        items: [
          { id: 1, sku: "SKU-101", description: "Paper A4 500pk", qty: 2, price: 5.5, tax: 5 },
          { id: 2, sku: "SKU-202", description: "Staplers", qty: 3, price: 8, tax: 0 },
        ],
        status: "Approved",
        createdAt: new Date().toISOString(),
      };
      setOrders([sampleOrder]);
    }
  }, []);

  // Persist orders to localStorage on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  // Form helpers
  function openCreateForm() {
    setForm({ ...blankForm, poNumber: generatePONumber() });
    setEditingOrderId(null);
    setErrors({});
    setView("form");
  }

  function openEditForm(orderId) {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;
    // deep clone to avoid shared references
    const copy = JSON.parse(JSON.stringify(ord));
    setForm(copy);
    setEditingOrderId(orderId);
    setErrors({});
    setView("form");
  }

  function handleFormChange(field, value) {
    if (field === "vendorId") {
      const vendor = sampleVendors.find((v) => v.id === value);
      setForm((f) => ({ ...f, vendorId: value, vendorName: vendor ? vendor.name : "" }));
    } else {
      setForm((f) => ({ ...f, [field]: value }));
    }
  }

  function handleItemChange(index, field, value) {
    setForm((f) => {
      const next = { ...f };
      next.items = next.items.map((it, idx) => {
        if (idx !== index) return it;
        return { ...it, [field]: value };
      });
      return next;
    });
  }

  function addItemRow() {
    setForm((f) => ({ ...f, items: [...f.items, defaultItem()] }));
  }

  function removeItemRow(index) {
    setForm((f) => {
      const next = { ...f, items: f.items.filter((_, i) => i !== index) };
      if (next.items.length === 0) next.items = [defaultItem()];
      return next;
    });
  }

  function computeTotals() {
    const sub = form.items.reduce((acc, it) => acc + Number(it.qty || 0) * Number(it.price || 0), 0);
    const taxTotal = form.items.reduce((acc, it) => acc + ((Number(it.tax || 0) / 100) * Number(it.qty || 0) * Number(it.price || 0)), 0);
    const shipping = Number(form.shippingFee || 0);
    const grand = sub + taxTotal + shipping;
    return { subtotal: sub, taxTotal, shipping, grand };
  }

  function validateForm() {
    const err = {};
    if (!form.vendorId) err.vendorId = "Vendor is required";
    if (!form.orderDate) err.orderDate = "Order date is required";
    // validate items
    const itemErrors = form.items.map((it) => {
      const e = {};
      if (!it.description || it.description.trim() === "") e.description = "Required";
      if (!it.qty || Number(it.qty) <= 0) e.qty = "Qty > 0";
      if (Number(it.price) < 0) e.price = "Price cannot be negative";
      return e;
    });
    const anyItemError = itemErrors.some((ie) => Object.keys(ie).length > 0);
    if (anyItemError) err.items = itemErrors;
    const hasValidItem = form.items.some((it) => Number(it.qty) > 0 && Number(it.price) >= 0 && it.description.trim() !== "");
    if (!hasValidItem) err.itemsSummary = "At least one valid item is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  function saveForm() {
    if (!validateForm()) return;
    const orderToSave = {
      ...form,
      id: editingOrderId || `po-${Date.now()}`,
      createdAt: form.createdAt || new Date().toISOString(),
    };
    if (editingOrderId) {
      setOrders((prev) => prev.map((o) => (o.id === editingOrderId ? orderToSave : o)));
    } else {
      setOrders((prev) => [orderToSave, ...prev]);
    }
    setView("grid");
  }

  function deleteOrder(orderId) {
    if (!window.confirm("Delete this purchase order?")) return;
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  }

  // UI small helpers
  function countItems(order) {
    return order.items.reduce((acc, it) => acc + Number(it.qty || 0), 0);
  }

  return (
    <div className="po-app-root">
      <style>{`
        /* Simple, self-contained styles for the component */
        .po-app-root {
          min-height: 100vh;
          padding: 32px;
          box-sizing: border-box;
          background: linear-gradient(180deg, #f3f8ff 0%, #ffffff 100%);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          color: #1f2937;
        }
        .container {
          max-width: 1100px;
          margin: 0 auto;
        }
        .card {
          background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(250,250,255,0.95));
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(16,24,40,0.08);
          padding: 20px;
          margin-bottom: 20px;
        }
        .header {
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap: 12px;
        }
        .title {
          font-weight: 700;
          font-size: 20px;
          display:flex;
          gap: 10px;
          align-items:center;
        }
        .muted {
          color: #6b7280;
          font-size: 13px;
        }
        .btn {
          background: linear-gradient(90deg,#3b82f6,#06b6d4);
          color:white;
          border:none;
          padding: 10px 14px;
          border-radius:10px;
          font-weight:600;
          cursor:pointer;
          box-shadow: 0 6px 18px rgba(59,130,246,0.18);
        }
        .btn.ghost {
          background: transparent;
          color: #3b82f6;
          box-shadow: none;
          border: 1px solid rgba(59,130,246,0.12);
        }
        .grid-table {
          width:100%;
          border-collapse: collapse;
          margin-top:16px;
        }
        .grid-table th {
          text-align:left;
          padding:12px;
          color:#374151;
          font-size:13px;
          font-weight:600;
        }
        .grid-table td {
          padding:12px;
          border-top:1px solid #eef2ff;
          vertical-align:top;
          font-size:12px;
        }
        .action-btn {
          background: transparent;
          border: none;
          color: #374151;
          padding:6px 8px;
          cursor:pointer;
          border-radius:8px;
        }
        .chip {
          padding:6px 8px;
          border-radius:999px;
          font-weight:600;
          font-size:12px;
          display:inline-block;
        }
        .status-draft { background:#eef2ff; color:#0f172a; }
        .status-approved { background:#ecfdf5; color:#065f46; }
        .status-pending { background:#fff7ed; color:#92400e; }

        /* Form */
        .form-grid {
          display:grid;
          grid-template-columns: 1fr 320px;
          gap: 20px;
        }
        .field {
          margin-bottom:12px;
        }
        label {
          display:block;
          margin-bottom:6px;
          color:#374151;
          font-weight:600;
          font-size:13px;
        }
        input[type="text"], input[type="date"], input[type="number"], select, textarea {
          width:100%;
          padding:10px 12px;
          border-radius:10px;
          border:1px solid #e6eefc;
          background:white;
          box-shadow: inset 0 1px 0 rgba(0,0,0,0.02);
          font-size:14px;
          color:#0f172a;
        }
        textarea { min-height: 90px; resize:vertical; }
        .items-table {
          width:100%;
          border-collapse: collapse;
          margin-top:8px;
        }
        .items-table th, .items-table td  {
          padding:8px;
          text-align:left;
          border-top:1px solid #eef2ff;
          font-size:13px;
        }
        .small {
          font-size:13px;
          color:#6b7280;
        }
        .right { text-align:right; }

        .totals {
          margin-top:12px;
          padding-top:12px;
          border-top:1px dashed #e6eefc;
        }
        .tot-row {
          display:flex;
          justify-content:space-between;
          margin-bottom:8px;
          gap: 12px;
          align-items:center;
        }
        .negative { color:#dc2626; }
        .error {
          color:#b91c1c;
          font-size:13px;
          margin-top:6px;
        }

        /* Responsive */
        @media (max-width: 920px) {
          .form-grid { grid-template-columns: 1fr; }
        }

      `}</style>

      <div className="container">
        {view === "grid" && (
          <div className="card">
            <div className="header">
              <div>
                <div className="title">Purchase Orders</div>
                <div className="muted">Manage purchase orders and line items</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn ghost" onClick={() => { localStorage.removeItem(STORAGE_KEY); setOrders([]); }}>
                  Clear All
                </button>
                <button className="btn" onClick={openCreateForm}>Create Purchase Order</button>
              </div>
            </div>

            <table className="grid-table" aria-label="Purchase orders table">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Vendor</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="right">Items</th>
                  <th className="right">Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: 30, textAlign: "center", color: "#6b7280" }}>
                      No purchase orders yet. Click "Create Purchase Order" to begin.
                    </td>
                  </tr>
                )}
                {orders.map((o) => {
                  const subtotal = o.items.reduce((acc, it) => acc + Number(it.qty || 0) * Number(it.price || 0), 0);
                  const taxTotal = o.items.reduce((acc, it) => acc + (Number(it.tax || 0) / 100) * Number(it.qty || 0) * Number(it.price || 0), 0);
                  const total = subtotal + taxTotal + Number(o.shippingFee || 0);
                  return (
                    <tr key={o.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{o.poNumber}</div>
                        <div className="muted small">Created: {new Date(o.createdAt).toLocaleString()}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{o.vendorName}</div>
                        <div className="muted small">{o.billingAddress ? (o.billingAddress.length > 40 ? o.billingAddress.slice(0, 40) + "…" : o.billingAddress) : ""}</div>
                      </td>
                      <td>{o.orderDate}</td>
                      <td>
                        <div className={`chip ${o.status === "Draft" ? "status-draft" : o.status === "Approved" ? "status-approved" : "status-pending"}`}>
                          {o.status}
                        </div>
                      </td>
                      <td className="right">{countItems(o)}</td>
                      <td className="right">{formatCurrency(total)}</td>
                      <td>
                        <button className="action-btn" title="Edit" onClick={() => openEditForm(o.id)}>✏️</button>
                        <button className="action-btn" title="Delete" onClick={() => deleteOrder(o.id)}>🗑️</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {view === "form" && (
          <div className="card">
            <div className="header" style={{ marginBottom: 12 }}>
              <div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <button className="btn ghost" onClick={() => setView("grid")} style={{ padding: "8px 10px" }}>← Back</button>
                  <div className="title">{editingOrderId ? "Edit Purchase Order" : "Create Purchase Order"}</div>
                </div>
                <div className="muted">Fill in the details and add items below.</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn ghost" onClick={() => { setForm(blankForm); setErrors({}); }}>Reset</button>
                <button className="btn" onClick={saveForm}>Submit & Save</button>
              </div>
            </div>

            <div className="form-grid">
              <div>
                <div className="field">
                  <label>PO Number</label>
                  <input type="text" value={form.poNumber} onChange={(e) => handleFormChange("poNumber", e.target.value)} />
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div className="field">
                      <label>Vendor</label>
                      <select value={form.vendorId} onChange={(e) => handleFormChange("vendorId", e.target.value)}>
                        {sampleVendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                      {errors.vendorId && <div className="error">{errors.vendorId}</div>}
                    </div>
                  </div>
                  <div style={{ width: 160 }}>
                    <div className="field">
                      <label>Order Date</label>
                      <input type="date" value={form.orderDate} onChange={(e) => handleFormChange("orderDate", e.target.value)} />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div className="field">
                      <label>Billing Address</label>
                      <textarea style={{widht: '111px', height: '67px'}} value={form.billingAddress} onChange={(e) => handleFormChange("billingAddress", e.target.value)} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="field">
                      <label>Shipping Address</label>
                      <textarea value={form.shippingAddress} onChange={(e) => handleFormChange("shippingAddress", e.target.value)} />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 6 }}>
                  <label style={{ marginBottom: 6 }}>Items</label>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th style={{ width: 36 }}>#</th>
                        <th>SKU / Description</th>
                        <th style={{ width: 100 }}>Qty</th>
                        <th style={{ width: 120 }}>Unit Price</th>
                        <th style={{ width: 100 }}>Tax %</th>
                        <th style={{ width: 120 }} className="right">Line Total</th>
                        <th style={{ width: 70 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((it, idx) => {
                        const lineTotal = calculateLineTotal(it);
                        const itemErr = errors.items ? errors.items[idx] : null;
                        return (
                          <tr key={it.id}>
                            <td>{idx + 1}</td>
                            <td>
                              <input type="text" value={it.sku} placeholder="SKU (optional)" onChange={(e) => handleItemChange(idx, "sku", e.target.value)} style={{ marginBottom: 6 }} />
                              <input type="text" value={it.description} placeholder="Item description" onChange={(e) => handleItemChange(idx, "description", e.target.value)} />
                              {itemErr && itemErr.description && <div className="error">{itemErr.description}</div>}
                            </td>
                            <td>
                              <input type="number" min="0" value={it.qty} onChange={(e) => handleItemChange(idx, "qty", Number(e.target.value))} />
                              {itemErr && itemErr.qty && <div className="error">{itemErr.qty}</div>}
                            </td>
                            <td>
                              <input type="number" step="0.01" value={it.price} onChange={(e) => handleItemChange(idx, "price", Number(e.target.value))} />
                              {itemErr && itemErr.price && <div className="error">{itemErr.price}</div>}
                            </td>
                            <td>
                              <input type="number" min="0" step="0.1" value={it.tax} onChange={(e) => handleItemChange(idx, "tax", Number(e.target.value))} />
                            </td>
                            <td className="right">{formatCurrency(lineTotal)}</td>
                            <td className="right">
                              <button className="action-btn" title="Remove" onClick={() => removeItemRow(idx)}>✖️</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn ghost" onClick={addItemRow}>+ Add Item</button>
                      {errors.itemsSummary && <div className="error">{errors.itemsSummary}</div>}
                    </div>
                    <div className="small muted">Enter items and their prices. Taxes applied per line.</div>
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <div className="field">
                    <label>Notes</label>
                    <textarea value={form.notes} onChange={(e) => handleFormChange("notes", e.target.value)} />
                  </div>
                </div>
              </div>

              <aside>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontWeight: 700 }}>Summary</div>
                  <div className="small muted">Preview totals</div>
                </div>

                <div className="card" style={{ padding: 14 }}>
                  <div style={{ marginBottom: 8 }}>
                    <label className="small">Expected Delivery</label>
                    <input type="date" value={form.expectedDate} onChange={(e) => handleFormChange("expectedDate", e.target.value)} />
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <label className="small">Shipping Fee</label>
                    <input type="number" step="0.01" value={form.shippingFee} onChange={(e) => handleFormChange("shippingFee", Number(e.target.value))} />
                  </div>

                  <div className="totals">
                    {(() => {
                      const t = computeTotals();
                      return (
                        <>
                          <div className="tot-row"><div className="small">Subtotal</div><div className="small">{formatCurrency(t.subtotal)}</div></div>
                          <div className="tot-row"><div className="small">Tax Total</div><div className="small">{formatCurrency(t.taxTotal)}</div></div>
                          <div className="tot-row"><div className="small">Shipping</div><div className="small">{formatCurrency(t.shipping)}</div></div>
                          <div style={{ height: 8 }} />
                          <div className="tot-row" style={{ fontWeight: 800, fontSize: 16 }}><div>Grand Total</div><div>{formatCurrency(t.grand)}</div></div>
                        </>
                      );
                    })()}
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button className="btn" onClick={saveForm} style={{ flex: 1 }}>Save Purchase Order</button>
                    <button className="btn ghost" onClick={() => { setView("grid"); }} style={{ flex: 1 }}>Cancel</button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}