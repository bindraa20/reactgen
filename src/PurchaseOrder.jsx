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

  // ✅ Wrap blankForm in useMemo to avoid ESLint warnings
  const blankForm = useMemo(() => ({
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
  }), []);

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

  // --- rest of your code remains same (openCreateForm, openEditForm, handleFormChange, etc.) ---
}
