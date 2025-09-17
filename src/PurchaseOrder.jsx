import React, { useEffect, useState, useMemo } from "react";

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
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}`;
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
  const [view, setView] = useState("grid");
  const [orders, setOrders] = useState([]);
  const [editingOrderId, setEditingOrderId] = useState(null);

  const defaultItem = () => ({
    id: Date.now() + Math.random(),
    sku: "",
    description: "",
    qty: 1,
    price: 0,
    tax: 0,
  });

  const blankForm = useMemo(
    () => ({
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
    }),
    []
  );

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
  }, [blankForm]);

  // Persist orders
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  // Form handlers
  function openCreateForm() {
    setForm({ ...blankForm, poNumber: generatePONumber() });
    setEditingOrderId(null);
    setErrors({});
    setView("form");
  }

  function openEditForm(orderId) {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    setForm({ ...order });
    setEditingOrderId(orderId);
    setErrors({});
    setView("form");
  }

  function handleFormChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleItemChange(index, field, value) {
    setForm((f) => {
      const newItems = [...f.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...f, items: newItems };
    });
  }

  function addItem() {
    setForm((f) => ({ ...f, items: [...f.items, defaultItem()] }));
  }

  function removeItem(index) {
    setForm((f) => {
      const newItems = [...f.items];
      newItems.splice(index, 1);
      return { ...f, items: newItems.length ? newItems : [defaultItem()] };
    });
  }

  function validateForm() {
    const err = {};
    if (!form.poNumber || form.poNumber.trim() === "") err.poNumber = "PO Number is required";
    if (!form.vendorId) err.vendorId = "Vendor is required";
    if (!form.orderDate) err.orderDate = "Order Date is required";
    if (!form.items || !form.items.length) err.items = "At least one item is required";

    form.items.forEach((item, idx) => {
      if (!item.sku || item.sku.trim() === "") err[`itemSku${idx}`] = "SKU is required";
      if (!item.description || item.description.trim() === "") err[`itemDesc${idx}`] = "Description is required";
      if (item.qty == null || Number(item.qty) <= 0) err[`itemQty${idx}`] = "Quantity must be > 0";
      if (item.price == null || Number(item.price) < 0) err[`itemPrice${idx}`] = "Price must be ≥ 0";
      if (item.tax == null || Number(item.tax) < 0) err[`itemTax${idx}`] = "Tax must be ≥ 0";
    });

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
    if (!window.confirm("Delete this Purchase Order?")) return;
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  }

  return (
    <div className="po-app-root">
      <style>{`
        /* Container and layout */
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

        /* Buttons */
        .btn {
          background: linear-gradient(90deg,#3b82f6,#06b6d4);
          color:white;
          border:none;
          padding: 10px 14px;
          border-radius:10px;
          font-weight:600;
          cursor:pointer;
          box-shadow: 0 6px 18px rgba(59,130,246,0.18);
          transition: background-color 0.3s ease;
        }
        .btn:hover {
          background: linear-gradient(90deg,#1e40af,#0891b2);
        }
        .btn.ghost {
          background: transparent;
          color: #3b82f6;
          box-shadow: none;
          border: 1px solid rgba(59,130,246,0.12);
        }
        .btn.ghost:hover {
          background: rgba(59,130,246,0.12);
        }

        /* Table grid */
        table.grid-table {
          width:100%;
          border-collapse: collapse;
          margin-top:16px;
          font-size: 14px;
        }
        table.grid-table th {
          text-align:left;
          padding:12px;
          color:#374151;
          font-weight:600;
          font-size:13px;
          border-bottom: 2px solid #e6eefc;
          user-select: none;
          background: #f9fafb;
        }
        table.grid-table td {
          padding:12px;
          border-top:1px solid #eef2ff;
          vertical-align:top;
          border-bottom: 1px solid #f3f8ff;
          color: #1f2937;
        }
        .action-btn {
          background: transparent;
          border: none;
          color: #374151;
          padding:6px 8px;
          cursor:pointer;
          border-radius:8px;
          font-size: 18px;
          line-height: 1;
          transition: color 0.3s ease;
        }
        .action-btn:hover {
          color: #2563eb;
        }

        /* Form layout */
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
          user-select: none;
        }
        input[type="text"], input[type="number"], select, textarea {
          width:100%;
          padding:10px 12px;
          border-radius:10px;
          border:1px solid #e6eefc;
          background:white;
          box-shadow: inset 0 1px 0 rgba(0,0,0,0.02);
          font-size:14px;
          color:#0f172a;
          transition: border-color 0.3s ease;
        }
        input[type="text"]:focus,
        input[type="number"]:focus,
        select:focus,
        textarea:focus {
          border-color: #3b82f6;
          outline: none;
          box-shadow: 0 0 6px #3b82f6aa;
        }
        textarea { min-height: 90px; resize:vertical; }
        .right { text-align:right; }
        .error {
          color:#b91c1c;
          font-size:13px;
          margin-top:6px;
          user-select: none;
        }

        /* Responsive */
        @media (max-width: 920px) {
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="container">
        {view === "grid" && (
          <div className="card" role="region" aria-label="Purchase orders list">
            <div className="header">
              <div>
                <div className="title" tabIndex={-1}>Purchase Orders</div>
                <div className="muted">Manage your purchase orders</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn ghost"
                  onClick={() => {
                    if (window.confirm("Clear all purchase orders? This cannot be undone.")) {
                      localStorage.removeItem(STORAGE_KEY);
                      setOrders([]);
                    }
                  }}
                  aria-label="Clear all purchase orders"
                >
                  Clear All
                </button>
                <button className="btn" onClick={openCreateForm} aria-label="Create new purchase order">
                  Create Purchase Order
                </button>
              </div>
            </div>

            <table className="grid-table" aria-describedby="purchase-orders-description" role="table">
              <thead>
                <tr>
                  <th scope="col">PO Number</th>
                  <th scope="col">Vendor</th>
                  <th scope="col">Order Date</th>
                  <th scope="col">Expected Date</th>
                  <th scope="col" className="right">Shipping Fee</th>
                  <th scope="col" className="right">Total</th>
                  <th scope="col">Status</th>
                  <th scope="col" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 30, textAlign: "center", color: "#6b7280" }}>
                      No purchase orders yet. Click "Create Purchase Order" to add one.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    // Calculate total amount for order
                    const itemsTotal = order.items.reduce(
                      (acc, item) => acc + calculateLineTotal(item),
                      0
                    );
                    const totalAmount = itemsTotal + Number(order.shippingFee || 0);

                    return (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 700 }}>{order.poNumber}</td>
                        <td>{order.vendorName}</td>
                        <td>{order.orderDate}</td>
                        <td>{order.expectedDate || "-"}</td>
                        <td className="right">{formatCurrency(order.shippingFee)}</td>
                        <td className="right">{formatCurrency(totalAmount)}</td>
                        <td>
                          <div
                            className={`chip ${
                              order.status === "Approved"
                                ? "status-active"
                                : order.status === "Draft"
                                ? "status-inactive"
                                : ""
                            }`}
                            aria-label={`Status: ${order.status}`}
                          >
                            {order.status}
                          </div>
                        </td>
                        <td>
                          <button
                            className="action-btn"
                            title={`Edit purchase order ${order.poNumber}`}
                            aria-label={`Edit purchase order ${order.poNumber}`}
                            onClick={() => openEditForm(order.id)}
                          >
                            ✏️
                          </button>
                          <button
                            className="action-btn"
                            title={`Delete purchase order ${order.poNumber}`}
                            aria-label={`Delete purchase order ${order.poNumber}`}
                            onClick={() => deleteOrder(order.id)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {view === "form" && (
          <div
            className="card"
            role="region"
            aria-label={editingOrderId ? "Edit Purchase Order form" : "Create Purchase Order form"}
          >
            <div className="header" style={{ marginBottom: 12 }}>
              <div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <button
                    className="btn ghost"
                    onClick={() => setView("grid")}
                    style={{ padding: "8px 10px" }}
                    aria-label="Back to list"
                  >
                    ← Back
                  </button>
                  <div className="title" tabIndex={-1}>
                    {editingOrderId ? "Edit Purchase Order" : "Create Purchase Order"}
                  </div>
                </div>
                <div className="muted">Fill in the purchase order details below.</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn ghost"
                  onClick={() => {
                    setForm(blankForm);
                    setErrors({});
                  }}
                  aria-label="Reset form"
                >
                  Reset
                </button>
                <button className="btn" onClick={saveForm} aria-label="Submit and save form">
                  Submit & Save
                </button>
              </div>
            </div>

            <form
              className="form-grid"
              onSubmit={(e) => {
                e.preventDefault();
                saveForm();
              }}
              noValidate
            >
              <div>
                <div className="field">
                  <label htmlFor="poNumber">PO Number</label>
                  <input
                    id="poNumber"
                    type="text"
                    value={form.poNumber}
                    onChange={(e) => handleFormChange("poNumber", e.target.value)}
                    disabled={!!editingOrderId}
                    aria-invalid={!!errors.poNumber}
                    aria-describedby={errors.poNumber ? "poNumber-error" : undefined}
                  />
                  {errors.poNumber && (
                    <div className="error" id="poNumber-error" role="alert">
                      {errors.poNumber}
                    </div>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="vendorId">Vendor</label>
                  <select
                    id="vendorId"
                    value={form.vendorId}
                    onChange={(e) => {
                      const vid = e.target.value;
                      const vobj = sampleVendors.find((v) => v.id === vid);
                      handleFormChange("vendorId", vid);
                      handleFormChange("vendorName", vobj ? vobj.name : "");
                    }}
                    aria-invalid={!!errors.vendorId}
                    aria-describedby={errors.vendorId ? "vendorId-error" : undefined}
                  >
                    {sampleVendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                  {errors.vendorId && (
                    <div className="error" id="vendorId-error" role="alert">
                      {errors.vendorId}
                    </div>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="billingAddress">Billing Address</label>
                  <textarea
                    id="billingAddress"
                    value={form.billingAddress}
                    onChange={(e) => handleFormChange("billingAddress", e.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor="shippingAddress">Shipping Address</label>
                  <textarea
                    id="shippingAddress"
                    value={form.shippingAddress}
                    onChange={(e) => handleFormChange("shippingAddress", e.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor="orderDate">Order Date</label>
                  <input
                    id="orderDate"
                    type="date"
                    value={form.orderDate}
                    onChange={(e) => handleFormChange("orderDate", e.target.value)}
                    aria-invalid={!!errors.orderDate}
                    aria-describedby={errors.orderDate ? "orderDate-error" : undefined}
                  />
                  {errors.orderDate && (
                    <div className="error" id="orderDate-error" role="alert">
                      {errors.orderDate}
                    </div>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="expectedDate">Expected Date</label>
                  <input
                    id="expectedDate"
                    type="date"
                    value={form.expectedDate}
                    onChange={(e) => handleFormChange("expectedDate", e.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor="shippingFee">Shipping Fee</label>
                  <input
                    id="shippingFee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.shippingFee}
                    onChange={(e) => handleFormChange("shippingFee", Number(e.target.value))}
                  />
                </div>

                <div className="field">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => handleFormChange("notes", e.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    value={form.status}
                    onChange={(e) => handleFormChange("status", e.target.value)}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Approved">Approved</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Items section */}
              <aside>
                <div style={{ marginBottom: 12, fontWeight: "600", fontSize: 16 }}>
                  Items
                </div>
                {form.items.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      marginBottom: 16,
                      padding: 12,
                      borderRadius: 8,
                      background: "rgba(59,130,246,0.05)",
                    }}
                  >
                    <div className="field">
                      <label htmlFor={`sku-${idx}`}>SKU</label>
                      <input
                        id={`sku-${idx}`}
                        type="text"
                        value={item.sku}
                        onChange={(e) => handleItemChange(idx, "sku", e.target.value)}
                        aria-invalid={errors[`itemSku${idx}`] ? true : false}
                        aria-describedby={errors[`itemSku${idx}`] ? `itemSku${idx}-error` : undefined}
                      />
                      {errors[`itemSku${idx}`] && (
                        <div className="error" id={`itemSku${idx}-error`} role="alert">
                          {errors[`itemSku${idx}`]}
                        </div>
                      )}
                    </div>

                    <div className="field">
                      <label htmlFor={`desc-${idx}`}>Description</label>
                      <input
                        id={`desc-${idx}`}
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                        aria-invalid={errors[`itemDesc${idx}`] ? true : false}
                        aria-describedby={errors[`itemDesc${idx}`] ? `itemDesc${idx}-error` : undefined}
                      />
                      {errors[`itemDesc${idx}`] && (
                        <div className="error" id={`itemDesc${idx}-error`} role="alert">
                          {errors[`itemDesc${idx}`]}
                        </div>
                      )}
                    </div>

                    <div className="field">
                      <label htmlFor={`qty-${idx}`}>Qty</label>
                      <input
                        id={`qty-${idx}`}
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, "qty", Number(e.target.value))}
                        aria-invalid={errors[`itemQty${idx}`] ? true : false}
                        aria-describedby={errors[`itemQty${idx}`] ? `itemQty${idx}-error` : undefined}
                      />
                      {errors[`itemQty${idx}`] && (
                        <div className="error" id={`itemQty${idx}-error`} role="alert">
                          {errors[`itemQty${idx}`]}
                        </div>
                      )}
                    </div>

                    <div className="field">
                      <label htmlFor={`price-${idx}`}>Price</label>
                      <input
                        id={`price-${idx}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.price}
                        onChange={(e) => handleItemChange(idx, "price", Number(e.target.value))}
                        aria-invalid={errors[`itemPrice${idx}`] ? true : false}
                        aria-describedby={errors[`itemPrice${idx}`] ? `itemPrice${idx}-error` : undefined}
                      />
                      {errors[`itemPrice${idx}`] && (
                        <div className="error" id={`itemPrice${idx}-error`} role="alert">
                          {errors[`itemPrice${idx}`]}
                        </div>
                      )}
                    </div>

                    <div className="field">
                      <label htmlFor={`tax-${idx}`}>Tax %</label>
                      <input
                        id={`tax-${idx}`}
                        type="number"
                        step="0.1"
                        min="0"
                        value={item.tax}
                        onChange={(e) => handleItemChange(idx, "tax", Number(e.target.value))}
                        aria-invalid={errors[`itemTax${idx}`] ? true : false}
                        aria-describedby={errors[`itemTax${idx}`] ? `itemTax${idx}-error` : undefined}
                      />
                      {errors[`itemTax${idx}`] && (
                        <div className="error" id={`itemTax${idx}-error`} role="alert">
                          {errors[`itemTax${idx}`]}
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <button
                        type="button"
                        className="btn ghost"
                        style={{ fontSize: "13px", padding: "6px 10px" }}
                        onClick={() => removeItem(idx)}
                        aria-label={`Remove item ${item.sku || idx + 1}`}
                      >
                        Remove Item
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn"
                  onClick={addItem}
                  aria-label="Add new item"
                >
                  + Add Item
                </button>
              </aside>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}