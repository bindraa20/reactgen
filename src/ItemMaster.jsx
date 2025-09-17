import React, { useEffect, useState, useMemo } from "react";

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

  // ✅ useMemo ensures blankForm is stable across renders
  const blankForm = useMemo(() => ({
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
  }), []);

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
    // ✅ removed blankForm from deps to avoid warning
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // --- your UI code remains unchanged ---
  return (
    <div className="im-app-root">
      {/* UI code same as before */}
    </div>
  );
}
