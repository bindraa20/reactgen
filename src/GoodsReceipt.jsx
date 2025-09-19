import React, { useState } from "react";

// Sample data for Goods Receipts
const sampleGRs = [
  {
    id: 1,
    grNumber: "GR-20250920-1001",
    poNumber: "PO-20250912-6424",
    supplier: "Acme Supplies Co.",
    receiptDate: "2025-09-20",
    status: "Received",
    items: [
      { description: "Men face W", qtyAccepted: 10, qtyRejected: 0, unitPrice: 12, taxPercent: 40 },
      { description: "Men Face c", qtyAccepted: 14, qtyRejected: 1, unitPrice: 17, taxPercent: 10 },
    ],
    otherCharges: { shippingFee: 110, notes: "Goods received and inspected" },
    billingAddress:
      "DLF phase 3, Moti nagar industrial Area, Delhi,110008 India",
    shippingAddress:
      "DLF phase 3, Moti nagar industrial Area, Delhi,110008 India",
  },
];

// Outer Grid Columns:
// GR Number, PO Number, Supplier, Receipt Date, Status, Total Amount

const GoodsReceiptSystem = () => {
  const [goodsReceipts, setGoodsReceipts] = useState(sampleGRs);
  const [filter, setFilter] = useState("");
  const [selectedGR, setSelectedGR] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Filtered goods receipts by GR Number, PO Number or Supplier
  const filteredGRs = goodsReceipts.filter(
    (gr) =>
      gr.grNumber.toLowerCase().includes(filter.toLowerCase()) ||
      gr.poNumber.toLowerCase().includes(filter.toLowerCase()) ||
      gr.supplier.toLowerCase().includes(filter.toLowerCase())
  );

  // Handlers
  const openCreateForm = () => {
    setSelectedGR(null);
    setIsEditing(true);
  };

  const openEditForm = (gr) => {
    setSelectedGR(gr);
    setIsEditing(true);
  };

  const closeForm = () => {
    setSelectedGR(null);
    setIsEditing(false);
  };

  const saveGoodsReceipt = (gr) => {
    if (gr.id) {
      // Edit existing
      setGoodsReceipts((prev) =>
        prev.map((g) => (g.id === gr.id ? gr : g))
      );
    } else {
      // Create new
      gr.id = Date.now();
      setGoodsReceipts((prev) => [...prev, gr]);
    }
    closeForm();
  };

  const deleteItem = (id) => {
    if (window.confirm("Are you sure you want to delete this goods receipt?")) {
      setGoodsReceipts((prev) => prev.filter((gr) => gr.id !== id));
      if (selectedGR?.id === id) {
        closeForm();
      }
    }
  };

  return (
    <div
      style={{
        padding: 20,
        fontFamily:
          "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
      className="gr-app-root"
    >
      <style>{`
        /* Reuse PurchaseOrder styles for consistency */
        .gr-app-root {
          min-height: 100vh;
          background: linear-gradient(180deg, #f3f8ff 0%, #ffffff 100%);
          color: #1f2937;
        }

        button {
          font-family: inherit;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s ease;
          border-radius: 10px;
          box-shadow: 1  6px 11px rgba(59,130,246,0.18);
        }
        button:hover {
          filter: brightness(0.9);
        }

        button.primary {
          background: linear-gradient(90deg,#3b82f6,#06b6d4);
          color: white;
          border: none;
          padding: 10px 14px;
        }
        button.primary:hover {
          background: linear-gradient(90deg,#1e40af,#0891b2);
        }

        button.ghost {
          background: transparent;
          color: #3b82f6;
          box-shadow: none;
          border: 1px solid rgba(59,130,246,0.12);
        }
        button.ghost:hover {
          background: rgba(59,130,246,0.12);
        }

        input[type="text"], input[type="number"], input[type="date"], select, textarea {
          border-radius: 10px;
          border: 1px solid #e6eefc;
          background: white;
          box-shadow: inset 0 1px 0 rgba(0,0,0,0.02);
          font-size: 14px;
          color: #0f172a;
          padding: 10px 12px;
          transition: border-color 0.3s ease;
        }
        input[type="text"]:focus,
        input[type="number"]:focus,
        input[type="date"]:focus,
        select:focus,
        textarea:focus {
          border-color: #3b82f6;
          outline: none;
          box-shadow: 0 0 6px #3b82f6aa;
        }

        table {
          font-size: 14px;
          color: #1f2937;
        }
        thead tr {
          background: #f9fafb;
          color: #374151;
          font-weight: 600;
          font-size: 13px;
          user-select: none;
          border-bottom: 2px solid #e6eefc;
        }
        th, td {
          padding: 12px;
          border-bottom: 1px solid #f3f8ff;
          vertical-align: top;
          text-align: left;
        }
        tbody tr:hover {
          background: #eef6ff;
        }

        .error {
          color: #b91c1c;
          font-size: 13px;
          margin-top: 6px;
          user-select: none;
        }

        .summary-panel {
          background-color: #fafafa;
          box-shadow: 0 0 10px rgba(0,0,0,0.05);
          border-radius: 8px;
          padding: 20px;
          border: 1px solid #ddd;
          height: fit-content;
          position: sticky;
          top: 20px;
          font-weight: 600;
          font-size: 16px;
          color: #1f2937;
        }
        .summary-panel label {
          font-weight: 600;
          font-size: 14px;
          display: block;
          margin-bottom: 4px;
        }
        .summary-panel div {
          margin-bottom: 10px;
        }
        .summary-panel .total-row {
          font-weight: 700;
          font-size: 16px;
          margin-top: 8px;
          display: flex;
          justify-content: space-between;
          color: #111827;
        }

        @media (max-width: 920px) {
          .summary-panel {
            position: static;
            margin-top: 20px;
          }
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
      `}</style>

      {!isEditing ? (
        <>
          <h2>Goods Receipts</h2>
          <div
            style={{
              marginBottom: 10,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <input
              type="text"
              placeholder="Filter by GR Number, PO Number or Supplier"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: "6px 10px",
                width: "300px",
                borderRadius: 4,
                border: "1px solid #ccc",
                fontFamily:
                  "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              }}
            />
            <button
              onClick={openCreateForm}
              className="primary"
              aria-label="Create Goods Receipt"
            >
              + Create Goods Receipt
            </button>
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              boxShadow: "0 0 5px rgba(0,0,0,0.1)",
              fontFamily:
                "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            }}
          >
            <thead>
              <tr>
                <th style={{ padding: "10px 12px" }}>GR Number</th>
                <th style={{ padding: "10px 12px" }}>PO Number</th>
                <th style={{ padding: "10px 12px" }}>Supplier</th>
                <th style={{ padding: "10px 12px" }}>Receipt Date</th>
                <th style={{ padding: "10px 12px" }}>Status</th>
                <th style={{ padding: "10px 12px", textAlign: "right" }}>
                  Total Amount
                </th>
                <th style={{ padding: "10px 12px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGRs.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{ padding: 20, textAlign: "center", color: "#777" }}
                  >
                    No goods receipts found.
                  </td>
                </tr>
              )}
              {filteredGRs.map((gr) => {
                // Calculate total for this GR
                const subtotal = gr.items.reduce((acc, item) => {
                  const lineTotal = item.qtyAccepted * item.unitPrice;
                  return acc + lineTotal;
                }, 0);
                const taxTotal = gr.items.reduce((acc, item) => {
                  const lineTotal = item.qtyAccepted * item.unitPrice;
                  const taxAmount = (lineTotal * item.taxPercent) / 100;
                  return acc + taxAmount;
                }, 0);
                const grandTotal = subtotal + taxTotal + Number(gr.otherCharges.shippingFee);

                return (
                  <tr
                    key={gr.id}
                    style={{
                      borderBottom: "1px solid #eee",
                      cursor: "pointer",
                    }}
                    onClick={() => openEditForm(gr)}
                    title="Click to edit"
                  >
                    <td style={{ padding: "10px 12px" }}>{gr.grNumber}</td>
                    <td style={{ padding: "10px 12px" }}>{gr.poNumber}</td>
                    <td style={{ padding: "10px 12px" }}>{gr.supplier}</td>
                    <td style={{ padding: "10px 12px" }}>
                      {new Date(gr.receiptDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "10px 12px" }}>{gr.status}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      ${grandTotal.toFixed(2)}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <button
                        className="action-btn"
                        title={`Edit goods receipt ${gr.grNumber}`}
                        aria-label={`Edit goods receipt ${gr.grNumber}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditForm(gr);
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn"
                        title={`Delete goods receipt ${gr.grNumber}`}
                        aria-label={`Delete goods receipt ${gr.grNumber}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteItem(gr.id);
                        }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      ) : (
        <GoodsReceiptForm
          goodsReceipt={selectedGR}
          onCancel={closeForm}
          onSave={saveGoodsReceipt}
        />
      )}
    </div>
  );
};

const GoodsReceiptForm = ({ goodsReceipt, onCancel, onSave }) => {
  // Initialize fields either from existing GR or defaults for new
  const [grNumber, setGrNumber] = useState(
    goodsReceipt?.grNumber ||
      `GR-${new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "")}-${Math.floor(Math.random() * 10000)}`
  );
  const [poNumber, setPoNumber] = useState(goodsReceipt?.poNumber || "");
  const [supplier, setSupplier] = useState(goodsReceipt?.supplier || "");
  const [receiptDate, setReceiptDate] = useState(
    goodsReceipt?.receiptDate || new Date().toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState(goodsReceipt?.status || "Pending");
  const [billingAddress, setBillingAddress] = useState(
    goodsReceipt?.billingAddress || ""
  );
  const [shippingAddress, setShippingAddress] = useState(
    goodsReceipt?.shippingAddress || ""
  );
  const [items, setItems] = useState(
    goodsReceipt?.items?.map((item, idx) => ({
      id: idx + 1,
      description: item.description,
      qtyAccepted: item.qtyAccepted,
      qtyRejected: item.qtyRejected,
      unitPrice: item.unitPrice,
      taxPercent: item.taxPercent,
    })) || [
      {
        id: 1,
        description: "",
        qtyAccepted: 0,
        qtyRejected: 0,
        unitPrice: 0,
        taxPercent: 0,
      },
    ]
  );
  const [shippingFee, setShippingFee] = useState(
    goodsReceipt?.otherCharges?.shippingFee || 0
  );
  const [notes, setNotes] = useState(goodsReceipt?.otherCharges?.notes || "");

  // Calculate totals similar as PO but with qtyAccepted
  const subtotal = items.reduce((acc, item) => {
    const lineTotal = item.qtyAccepted * item.unitPrice;
    return acc + lineTotal;
  }, 0);

  const taxTotal = items.reduce((acc, item) => {
    const lineTotal = item.qtyAccepted * item.unitPrice;
    const taxAmount = (lineTotal * item.taxPercent) / 100;
    return acc + taxAmount;
  }, 0);

  const grandTotal = subtotal + taxTotal + Number(shippingFee);

  // Handlers for items
  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        description: "",
        qtyAccepted: 0,
        qtyRejected: 0,
        unitPrice: 0,
        taxPercent: 0,
      },
    ]);
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplier || !receiptDate || !poNumber) {
      alert("Please fill in Supplier, PO Number and Receipt Date.");
      return;
    }
    if (items.length === 0) {
      alert("Please add at least one item.");
      return;
    }
    const gr = {
      id: goodsReceipt?.id || null,
      grNumber,
      poNumber,
      supplier,
      receiptDate,
      status,
      billingAddress,
      shippingAddress,
      items: items.map(({ id, ...rest }) => rest),
      otherCharges: {
        shippingFee: Number(shippingFee),
        notes,
      },
      totalAmount: grandTotal,
    };
    onSave(gr);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 960,
        margin: "auto",
        background: "white",
        padding: 20,
        borderRadius: 8,
        boxShadow: "0 0 15px rgba(0,0,0,0.1)",
        display: "flex",
        gap: 20,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
      noValidate
      aria-label={goodsReceipt ? "Edit Goods Receipt form" : "Create Goods Receipt form"}
    >
      {/* Left side: form fields */}
      <div style={{ flex: 3 }}>
        <button
          type="button"
          onClick={onCancel}
          className="ghost"
          style={{
            marginBottom: 12,
            fontWeight: "600",
            fontSize: 14,
            padding: "8px 10px",
          }}
          aria-label="Back to goods receipts"
        >
          ← Back
        </button>
        <h3 style={{ marginTop: 0 }}>
          {goodsReceipt ? "Edit Goods Receipt" : "Create Goods Receipt"}
        </h3>
        <p style={{ color: "#555", marginTop: 0, marginBottom: 20 }}>
          Fill in the details and add items below.
        </p>

        <div style={{ marginBottom: 15 }}>
          <label htmlFor="grNumber" style={{ fontWeight: "600" }}>
            GR Number
          </label>
          <input
            id="grNumber"
            type="text"
            value={grNumber}
            readOnly
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 10,
              border: "1px solid #e6eefc",
              backgroundColor: "#f9f9f9",
              marginTop: 5,
              boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
              fontSize: 14,
              color: "#0f172a",
            }}
            aria-readonly="true"
          />
        </div>

        <div style={{ display: "flex", gap: 20, marginBottom: 15 }}>
          <div style={{ flex: 2 }}>
            <label htmlFor="poNumber" style={{ fontWeight: "600" }}>
              PO Number
            </label>
            <input
              id="poNumber"
              type="text"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              required
              placeholder="Reference PO Number"
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 10,
                border: "1px solid #e6eefc",
                marginTop: 5,
                boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
                fontSize: 14,
                color: "#0f172a",
              }}
              aria-required="true"
            />
          </div>

          <div style={{ flex: 2 }}>
            <label htmlFor="supplier" style={{ fontWeight: "600" }}>
              Vendor
            </label>
            <select
              id="supplier"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              required
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 10,
                border: "1px solid #e6eefc",
                marginTop: 5,
                boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
                fontSize: 14,
                color: "#0f172a",
              }}
              aria-required="true"
            >
              <option value="">-- Select Vendor --</option>
              <option value="Acme Supplies Co.">Acme Supplies Co.</option>
              <option value="Global Traders Ltd.">Global Traders Ltd.</option>
              <option value="Supply Chain Inc.">Supply Chain Inc.</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label htmlFor="receiptDate" style={{ fontWeight: "600" }}>
              Receipt Date
            </label>
            <input
              id="receiptDate"
              type="date"
              value={receiptDate}
              onChange={(e) => setReceiptDate(e.target.value)}
              required
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 10,
                border: "1px solid #e6eefc",
                marginTop: 5,
                boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
                fontSize: 14,
                color: "#0f172a",
              }}
              aria-required="true"
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, marginBottom: 15 }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="billingAddress" style={{ fontWeight: "600" }}>
              Billing Address
            </label>
            <textarea
              id="billingAddress"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 10,
                border: "1px solid #e6eefc",
                marginTop: 5,
                resize: "vertical",
                boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
                fontSize: 14,
                color: "#0f172a",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="shippingAddress" style={{ fontWeight: "600" }}>
              Shipping Address
            </label>
            <textarea
              id="shippingAddress"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 10,
                border: "1px solid #e6eefc",
                marginTop: 5,
                resize: "vertical",
                boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
                fontSize: 14,
                color: "#0f172a",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="status" style={{ fontWeight: "600" }}>
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 10,
                border: "1px solid #e6eefc",
                marginTop: 5,
                boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
                fontSize: 14,
                color: "#0f172a",
              }}
            >
              <option value="Pending">Pending</option>
              <option value="Received">Received</option>
              <option value="Partially Received">Partially Received</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Items section */}
        <fieldset
          style={{
            border: "1px solid #e6eefc",
            borderRadius: 12,
            padding: 16,
            marginBottom: 15,
            boxShadow: "0 8px 30px rgba(16,24,40,0.08)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(250,250,255,0.95))",
          }}
        >
          <legend
            style={{
              fontWeight: "700",
              padding: "0 10px",
              color: "#374151",
              fontSize: 16,
            }}
          >
            Item Information
          </legend>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f9fafb",
                  textAlign: "left",
                  borderBottom: "2px solid #e6eefc",
                  color: "#374151",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                <th style={{ padding: "6px 10px", width: "40%" }}>
                  SKU / Description
                </th>
                <th style={{ padding: "6px 10px", width: "10%" }}>Qty Accepted</th>
                <th style={{ padding: "6px 10px", width: "10%" }}>Qty Rejected</th>
                <th style={{ padding: "6px 10px", width: "15%" }}>
                  Unit Price
                </th>
                <th style={{ padding: "6px 10px", width: "15%" }}>Tax %</th>
                <th
                  style={{
                    padding: "6px 10px",
                    width: "15%",
                    textAlign: "right",
                  }}
                >
                  Line Total
                </th>
                <th style={{ padding: "6px 10px", width: "5%" }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const lineTotal =
                  item.qtyAccepted * item.unitPrice * (1 + item.taxPercent / 100);
                return (
                  <tr
                    key={item.id}
                    style={{ borderBottom: "1px solid #eef2ff" }}
                  >
                    <td style={{ padding: "6px 10px" }}>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(item.id, "description", e.target.value)
                        }
                        placeholder="Description"
                        style={{
                          width: "100%",
                          padding: 10,
                          borderRadius: 10,
                          border: "1px solid #e6eefc",
                          boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
                          fontSize: 14,
                          color: "#0f172a",
                        }}
                        required
                        aria-label={`Description for item ${idx + 1}`}
                      />
                    </td>
                    <td style={{ padding: "6px 10px" }}>
                      <input
                        type="number"
                        min="0"
                        value={item.qtyAccepted}
                        onChange={(e) =>
                          updateItem(item.id, "qtyAccepted", Number(e.target.value))
                        }
                        style={{
                          width: "100%",
                          padding: 10,
                          borderRadius: 10,
                          border: "1px solid #e6eefc",
                          boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
                          fontSize: 14,
                          color: "#0f172a",
                        }}
                        required
                        aria-label={`Quantity accepted for item ${idx + 1}`}
                      />
                    </td>
                    <td style={{ padding: "6px 10px" }}>
                      <input
                        type="number"
                        min="0"
                        value={item.qtyRejected}
                        onChange={(e) =>
                          updateItem(item.id, "qtyRejected", Number(e.target.value))
                        }
                        style={{
                          width: "100%",
                          padding: 10,
                          borderRadius: 10,
                          border: "1px solid #e6eefc",
                          boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
                          fontSize: 14,
                          color: "#0f172a",
                        }}
                        aria-label={`Quantity rejected for item ${idx + 1}`}
                      />
                    </td>
                    <td style={{ padding: "6px 10px" }}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "unitPrice",
                            Number(e.target.value)
                          )
                        }
                        style={{
                          width: "100%",
                          padding: 10,
                          borderRadius: 10,
                          border: "1px solid #e6eefc",
                          boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
                          fontSize: 14,
                          color: "#0f172a",
                        }}
                        required
                        aria-label={`Unit price for item ${idx + 1}`}
                      />
                    </td>
                    <td style={{ padding: "6px 10px" }}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.taxPercent}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "taxPercent",
                            Number(e.target.value)
                          )
                        }
                        style={{
                          width: "100%",
                          padding: 10,
                          borderRadius: 10,
                          border: "1px solid #e6eefc",
                          boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
                          fontSize: 14,
                          color: "#0f172a",
                        }}
                        aria-label={`Tax percent for item ${idx + 1}`}
                      />
                    </td>
                    <td
                      style={{
                        padding: "6px 10px",
                        textAlign: "right",
                        fontWeight: "600",
                        color: "#1f2937",
                      }}
                    >
                      ${lineTotal.toFixed(2)}
                    </td>
                    <td style={{ padding: "6px 10px", textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove item ${idx + 1}`}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#991b1b",
                          fontWeight: "bold",
                          cursor: "pointer",
                          fontSize: 18,
                          lineHeight: 1,
                          borderRadius: 10,
                          padding: 4,
                          transition: "color 0.3s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#b91c1c")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "#991b1b")
                        }
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button
            type="button"
            onClick={addItem}
            className="ghost"
            style={{
              marginTop: 8,
              fontWeight: "600",
              fontSize: 14,
              padding: "6px 14px",
            }}
          >
            + Add Item
          </button>
          <small
            style={{ display: "block", marginTop: 4, color: "#555", fontSize: 12 }}
          >
            Enter items and their prices. Taxes applied per line.
          </small>
        </fieldset>

        {/* Other Charges */}
        <fieldset
          style={{
            border: "1px solid #e6eefc",
            borderRadius: 12,
            padding: 16,
            marginBottom: 15,
            boxShadow: "0 8px 30px rgba(16,24,40,0.08)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(250,250,255,0.95))",
          }}
        >
          <legend
            style={{
              fontWeight: "700",
              padding: "0 10px",
              color: "#374151",
              fontSize: 16,
            }}
          >
            Other Charges
          </legend>
          <div
            style={{
              display: "flex",
              gap: 20,
              alignItems: "center",
            }}
          >
            <label
              htmlFor="shippingFee"
              style={{ flex: "0 0 120px", fontWeight: "600" }}
            >
              Shipping Fee
            </label>
            <input
              id="shippingFee"
              type="number"
              min="0"
              step="0.01"
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
              style={{
                flex: "1",
                padding: 10,
                borderRadius: 10,
                border: "1px solid #e6eefc",
                boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
                fontSize: 14,
                color: "#0f172a",
              }}
              aria-label="Shipping Fee"
            />
          </div>
        </fieldset>

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="notes" style={{ fontWeight: "600" }}>
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add any notes here..."
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 10,
              border: "1px solid #e6eefc",
              boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
              resize: "vertical",
              marginTop: 5,
              fontSize: 14,
              color: "#0f172a",
            }}
            aria-label="Notes"
          />
        </div>
      </div>

      {/* Right side: Summary panel */}
      <div className="summary-panel">
        <div style={{ marginBottom: 15, fontWeight: "600", fontSize: 16 }}>
          Summary
        </div>

        <div style={{ marginBottom: 10 }}>
          <label htmlFor="receiptDateSummary">Receipt Date</label>
          <input
            id="receiptDateSummary"
            type="date"
            value={receiptDate}
            onChange={(e) => setReceiptDate(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 10,
              border: "1px solid #e6eefc",
              marginTop: 5,
              boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
              fontSize: 14,
              color: "#0f172a",
            }}
            aria-required="true"
            aria-label="Receipt Date"
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label htmlFor="shippingFeeSummary">Shipping Fee</label>
          <input
            id="shippingFeeSummary"
            type="number"
            min="0"
            step="0.01"
            value={shippingFee}
            onChange={(e) => setShippingFee(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 10,
              border: "1px solid #e6eefc",
              marginTop: 5,
              boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
              fontSize: 14,
              color: "#0f172a",
            }}
            aria-label="Shipping Fee"
          />
        </div>

        <div
          style={{
            borderTop: "1px solid #e6eefc",
            paddingTop: 10,
            marginTop: 10,
            fontSize: 14,
            color: "#555",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span>Tax Total</span>
            <span>${taxTotal.toFixed(2)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span>Shipping</span>
            <span>${Number(shippingFee).toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span>Grand Total</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <button
            type="submit"
            className="primary"
            style={{
              flex: 1,
              borderRadius: 10,
              fontWeight: "600",
              fontSize: 16,
              padding: "10px 0",
            }}
          >
            Submit & Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="ghost"
            style={{
              flex: 1,
              fontWeight: "600",
              fontSize: 16,
              padding: "10px 0",
              borderRadius: 10,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

export default GoodsReceiptSystem;