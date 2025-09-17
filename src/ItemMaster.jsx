import React, { useEffect, useState } from "react";

/*
  ItemMaster.jsx
  - Outer Grid: list of items + Create button (with fewer columns for better layout)
  - Item Master Form: create/edit item with all standard fields including Brand, Model, Barcode, Reorder Level & Reorder Qty
  - Saves to localStorage for persistence
  - Responsive and modern UI consistent with Purchase Orders component
*/

const STORAGE_KEY = "item_master_v1";

function generateItemCode() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ITM-${date}-${rand}`;
}

function formatCurrency(val) {
  return val == null ? "" : "$" + Number(val).toFixed(2);
}

export default function ItemMaster() {
  const [view, setView] = useState("grid"); // 'grid' | 'form'
  const [items, setItems] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);

  const blankForm = {
    id: null,
    itemCode: generateItemCode(),
    description: "",
    category: "",
    unitOfMeasure: "",
    brand: "",
    model: "",
    barcode: "",
    reorderLevel: 0,
    reorderQuantity: 0,
    price: 0,
    taxPercent: 0,
    supplier: "",
    notes: "",
    status: "Active",
    createdAt: new Date().toISOString(),
  };

  const [form, setForm] = useState(blankForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setItems(parsed);
      } catch (e) {
        console.warn("Failed to parse local storage item master", e);
      }
    } else {
      const sampleItem = {
        ...blankForm,
        id: "sample-1",
        itemCode: "ITM-SAMPLE-0001",
        description: "Sample Item - Office Chair",
        category: "Furniture",
        unitOfMeasure: "Each",
        brand: "Acme",
        model: "AC123",
        barcode: "1234567890123",
        reorderLevel: 5,
        reorderQuantity: 10,
        price: 120.5,
        taxPercent: 10,
        supplier: "Acme Supplies Co.",
        notes: "Ergonomic office chair with adjustable height.",
        status: "Active",
        createdAt: new Date().toISOString(),
      };
      setItems([sampleItem]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function openCreateForm() {
    setForm({ ...blankForm, itemCode: generateItemCode() });
    setEditingItemId(null);
    setErrors({});
    setView("form");
  }

  function openEditForm(itemId) {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    setForm({ ...item });
    setEditingItemId(itemId);
    setErrors({});
    setView("form");
  }

  function handleFormChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validateForm() {
    const err = {};
    if (!form.itemCode || form.itemCode.trim() === "") err.itemCode = "Item Code is required";
    if (!form.description || form.description.trim() === "") err.description = "Description is required";
    if (!form.category || form.category.trim() === "") err.category = "Category is required";
    if (!form.unitOfMeasure || form.unitOfMeasure.trim() === "") err.unitOfMeasure = "Unit of Measure is required";
    if (form.price == null || Number(form.price) < 0) err.price = "Price must be zero or positive";
    if (form.taxPercent == null || Number(form.taxPercent) < 0) err.taxPercent = "Tax % must be zero or positive";
    if (form.reorderLevel == null || Number(form.reorderLevel) < 0) err.reorderLevel = "Reorder Level must be zero or positive";
    if (form.reorderQuantity == null || Number(form.reorderQuantity) < 0) err.reorderQuantity = "Reorder Quantity must be zero or positive";
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  function saveForm() {
    if (!validateForm()) return;
    const itemToSave = {
      ...form,
      id: editingItemId || `itm-${Date.now()}`,
      createdAt: form.createdAt || new Date().toISOString(),
    };
    if (editingItemId) {
      setItems((prev) => prev.map((i) => (i.id === editingItemId ? itemToSave : i)));
    } else {
      setItems((prev) => [itemToSave, ...prev]);
    }
    setView("grid");
  }

  function deleteItem(itemId) {
    if (!window.confirm("Delete this item?")) return;
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  return (
    <div className="im-app-root">
      <style>{`
        .im-app-root {
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
        table.grid-table {
          width:100%;
          border-collapse: collapse;
          margin-top:16px;
        }
        table.grid-table th {
          text-align:left;
          padding:12px;
          color:#374151;
          font-size:13px;
          font-weight:600;
          border-bottom: 2px solid #e6eefc;
        }
        table.grid-table td {
          padding:12px;
          border-top:1px solid #eef2ff;
          vertical-align:top;
          font-size:14px;
          border-bottom: 1px solid #f3f8ff;
        }
        .action-btn {
          background: transparent;
          border: none;
          color: #374151;
          padding:6px 8px;
          cursor:pointer;
          border-radius:8px;
          font-size: 14px;
          line-height: 1;
        }
        .chip {
          padding:6px 12px;
          border-radius:999px;
          font-weight:600;
          font-size:12px;
          display:inline-block;
          user-select: none;
        }
        .status-active { background:#ecfdf5; color:#065f46; }
        .status-inactive { background:#fef2f2; color:#991b1b; }

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
        input[type="text"], input[type="number"], select, textarea {
          width:-webkit-fill-available;
          padding:10px 12px;
          border-radius:10px;
          border:1px solid #e6eefc;
          background:white;
          box-shadow: inset 0 1px 0 rgba(0,0,0,0.02);
          font-size:14px;
          color:#0f172a;
        }
        textarea { min-height: 90px; resize:vertical; }
        .right { text-align:right; }
        .error {
          color:#b91c1c;
          font-size:13px;
          margin-top:6px;
        }
        @media (max-width: 920px) {
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="container">
        {view === "grid" && (
          <div className="card">
            <div className="header">
              <div>
                <div className="title">Item Master</div>
                <div className="muted">Manage inventory items and details</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn ghost"
                  onClick={() => {
                    if (window.confirm("Clear all items? This cannot be undone.")) {
                      localStorage.removeItem(STORAGE_KEY);
                      setItems([]);
                    }
                  }}
                >
                  Clear All
                </button>
                <button className="btn" onClick={openCreateForm}>
                  Create Item
                </button>
              </div>
            </div>

            <table className="grid-table" aria-label="Item master table">
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>UOM</th>
                  {/* Brand column removed */}
                  <th className="right">Price</th>
                  <th className="right">Tax %</th>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: 30, textAlign: "center", color: "#6b7280" }}>
                      No items yet. Click "Create Item" to add one.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 700 }}>{item.itemCode}</td>
                      <td>{item.description}</td>
                      <td>{item.category}</td>
                      <td>{item.unitOfMeasure}</td>
                      {/* Brand cell removed */}
                      <td className="right">{formatCurrency(item.price)}</td>
                      <td className="right">{item.taxPercent}%</td>
                      <td>{item.supplier}</td>
                      <td>
                        <div className={`chip ${item.status === "Active" ? "status-active" : "status-inactive"}`}>
                          {item.status}
                        </div>
                      </td>
                      <td>
                        <button className="action-btn" title="Edit" onClick={() => openEditForm(item.id)}>
                          ✏️
                        </button>
                        <button className="action-btn" title="Delete" onClick={() => deleteItem(item.id)}>
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {view === "form" && (
          <div className="card">
            <div className="header" style={{ marginBottom: 12 }}>
              <div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <button className="btn ghost" onClick={() => setView("grid")} style={{ padding: "8px 10px" }}>
                    ← Back
                  </button>
                  <div className="title">{editingItemId ? "Edit Item" : "Create Item"}</div>
                </div>
                <div className="muted">Fill in the item details below.</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn ghost" onClick={() => { setForm(blankForm); setErrors({}); }}>
                  Reset
                </button>
                <button className="btn" onClick={saveForm}>
                  Submit & Save
                </button>
              </div>
            </div>

            <div className="form-grid">
              <div>
                <div className="field">
                  <label>Item Code</label>
                  <input
                    type="text"
                    value={form.itemCode}
                    onChange={(e) => handleFormChange("itemCode", e.target.value)}
                    disabled={!!editingItemId}
                  />
                  {errors.itemCode && <div className="error">{errors.itemCode}</div>}
                </div>

                <div className="field">
                  <label>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleFormChange("description", e.target.value)}
                  />
                  {errors.description && <div className="error">{errors.description}</div>}
                </div>

                <div className="field">
                  <label>Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => handleFormChange("category", e.target.value)}
                    placeholder="e.g. Electronics, Furniture"
                  />
                  {errors.category && <div className="error">{errors.category}</div>}
                </div>

                <div className="field">
                  <label>Unit of Measure</label>
                  <input
                    type="text"
                    value={form.unitOfMeasure}
                    onChange={(e) => handleFormChange("unitOfMeasure", e.target.value)}
                    placeholder="e.g. Each, Box, Kg"
                  />
                  {errors.unitOfMeasure && <div className="error">{errors.unitOfMeasure}</div>}
                </div>

                {/* Brand remains in form */}
                <div className="field">
                  <label>Brand</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => handleFormChange("brand", e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Model</label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => handleFormChange("model", e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Barcode</label>
                  <input
                    type="text"
                    value={form.barcode}
                    onChange={(e) => handleFormChange("barcode", e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Reorder Level</label>
                  <input
                    type="number"
                    min="0"
                    value={form.reorderLevel}
                    onChange={(e) => handleFormChange("reorderLevel", Number(e.target.value))}
                  />
                  {errors.reorderLevel && <div className="error">{errors.reorderLevel}</div>}
                </div>

                <div className="field">
                  <label>Reorder Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={form.reorderQuantity}
                    onChange={(e) => handleFormChange("reorderQuantity", Number(e.target.value))}
                  />
                  {errors.reorderQuantity && <div className="error">{errors.reorderQuantity}</div>}
                </div>
              </div>

              <aside>
                <div className="field">
                  <label>Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => handleFormChange("price", Number(e.target.value))}
                  />
                  {errors.price && <div className="error">{errors.price}</div>}
                </div>

                <div className="field">
                  <label>Tax %</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.taxPercent}
                    onChange={(e) => handleFormChange("taxPercent", Number(e.target.value))}
                  />
                  {errors.taxPercent && <div className="error">{errors.taxPercent}</div>}
                </div>

                <div className="field">
                  <label>Supplier</label>
                  <input
                    type="text"
                    value={form.supplier}
                    onChange={(e) => handleFormChange("supplier", e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => handleFormChange("status", e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="field">
                  <label>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => handleFormChange("notes", e.target.value)}
                  />
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}