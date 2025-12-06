// Basic config
const SHOP_NAME = "Bab-al-Sabr";
const OWNER_NAME = "Kumail Zaidi ibn Zia Haider";

const STORAGE_KEYS = {
  ATTARS: "babalsabr_attars",
  SALES: "babalsabr_sales",
};

// ======== Utility for localStorage ========
function loadData(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ======== State ========
let attars = loadData(STORAGE_KEYS.ATTARS);
let sales = loadData(STORAGE_KEYS.SALES);

// ======== DOM elements ========
const yearSpan = document.getElementById("year");

const attarForm = document.getElementById("attar-form");
const attarIdInput = document.getElementById("attar-id");
const attarNameInput = document.getElementById("attar-name");
const attarDescInput = document.getElementById("attar-description");
const attarQtyInput = document.getElementById("attar-quantity");
const attarCostInput = document.getElementById("attar-cost");
const attarSellInput = document.getElementById("attar-sell");
const resetAttarBtn = document.getElementById("reset-attar-btn");
const attarsTableBody = document.getElementById("attars-table-body");

const saleForm = document.getElementById("sale-form");
const saleAttarSelect = document.getElementById("sale-attar");
const saleQtyInput = document.getElementById("sale-quantity");
const saleUnitPriceInput = document.getElementById("sale-unit-price");
const salePriceHint = document.getElementById("sale-price-hint");
const salesTableBody = document.getElementById("sales-table-body");
const totalRevenueSpan = document.getElementById("total-revenue");

// ======== Init ========
function init() {
  yearSpan.textContent = new Date().getFullYear();
  renderAttars();
  renderSales();
  fillSaleAttarOptions();
}

document.addEventListener("DOMContentLoaded", init);

// ======== Attars ========
function renderAttars() {
  attarsTableBody.innerHTML = "";

  if (attars.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 6;
    td.textContent = "No attars added yet.";
    tr.appendChild(td);
    attarsTableBody.appendChild(tr);
    return;
  }

  attars.forEach((attar) => {
    const tr = document.createElement("tr");

    const nameTd = document.createElement("td");
    nameTd.textContent = attar.name;

    const qtyTd = document.createElement("td");
    qtyTd.textContent = attar.quantity;

    const costTd = document.createElement("td");
    costTd.textContent = attar.costPrice.toFixed(2);

    const sellTd = document.createElement("td");
    sellTd.textContent = attar.sellingPrice.toFixed(2);

    const descTd = document.createElement("td");
    descTd.textContent = attar.description || "";

    const actionsTd = document.createElement("td");
    actionsTd.className = "actions-cell";

    const editBtn = document.createElement("button");
    editBtn.className = "btn small secondary";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => loadAttarIntoForm(attar.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn small secondary";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteAttar(attar.id));

    actionsTd.appendChild(editBtn);
    actionsTd.appendChild(deleteBtn);

    tr.appendChild(nameTd);
    tr.appendChild(qtyTd);
    tr.appendChild(costTd);
    tr.appendChild(sellTd);
    tr.appendChild(descTd);
    tr.appendChild(actionsTd);

    attarsTableBody.appendChild(tr);
  });
}

function resetAttarForm() {
  attarIdInput.value = "";
  attarNameInput.value = "";
  attarDescInput.value = "";
  attarQtyInput.value = "";
  attarCostInput.value = "";
  attarSellInput.value = "";
  document.getElementById("save-attar-btn").textContent = "Save Attar";
}

function loadAttarIntoForm(id) {
  const attar = attars.find((a) => a.id === id);
  if (!attar) return;

  attarIdInput.value = attar.id;
  attarNameInput.value = attar.name;
  attarDescInput.value = attar.description || "";
  attarQtyInput.value = attar.quantity;
  attarCostInput.value = attar.costPrice;
  attarSellInput.value = attar.sellingPrice;
  document.getElementById("save-attar-btn").textContent = "Update Attar";
}

function deleteAttar(id) {
  if (!confirm("Delete this attar?")) return;

  // Prevent deleting if this attar has sales
  const hasSales = sales.some((s) => s.attarId === id);
  if (hasSales) {
    alert("Cannot delete: this attar has sales recorded.");
    return;
  }

  attars = attars.filter((a) => a.id !== id);
  saveData(STORAGE_KEYS.ATTARS, attars);
  renderAttars();
  fillSaleAttarOptions();
}

// Handle add / edit form submit
attarForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = attarIdInput.value ? parseInt(attarIdInput.value, 10) : null;
  const name = attarNameInput.value.trim();
  const description = attarDescInput.value.trim();
  const quantity = parseInt(attarQtyInput.value, 10);
  const costPrice = parseFloat(attarCostInput.value);
  const sellingPrice = parseFloat(attarSellInput.value);

  if (!name) {
    alert("Name is required.");
    return;
  }
  if (isNaN(quantity) || quantity < 0) {
    alert("Quantity must be a non-negative number.");
    return;
  }

  // Check duplicate name
  const duplicate = attars.find(
    (a) => a.name.toLowerCase() === name.toLowerCase() && a.id !== id
  );
  if (duplicate) {
    alert("An attar with this name already exists.");
    return;
  }

  if (id != null) {
    // Update existing
    const index = attars.findIndex((a) => a.id === id);
    if (index === -1) return;

    attars[index] = {
      ...attars[index],
      name,
      description,
      quantity,
      costPrice,
      sellingPrice,
    };
  } else {
    // Create new
    const newId = attars.length > 0 ? Math.max(...attars.map((a) => a.id)) + 1 : 1;
    const attar = {
      id: newId,
      name,
      description,
      quantity,
      costPrice,
      sellingPrice,
    };
    attars.push(attar);
  }

  saveData(STORAGE_KEYS.ATTARS, attars);
  renderAttars();
  fillSaleAttarOptions();
  resetAttarForm();
});

resetAttarBtn.addEventListener("click", () => {
  resetAttarForm();
});

// ======== Sale form ========
function fillSaleAttarOptions() {
  saleAttarSelect.innerHTML = "";

  if (attars.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "No attars available";
    saleAttarSelect.appendChild(opt);
    saleAttarSelect.disabled = true;
    saleUnitPriceInput.value = "";
    saleUnitPriceInput.disabled = true;
    saleQtyInput.disabled = true;
    salePriceHint.textContent = "";
    return;
  }

  saleAttarSelect.disabled = false;
  saleUnitPriceInput.disabled = false;
  saleQtyInput.disabled = false;

  attars.forEach((attar) => {
    const opt = document.createElement("option");
    opt.value = attar.id;
    opt.textContent = `${attar.name} (stock: ${attar.quantity})`;
    saleAttarSelect.appendChild(opt);
  });

  updateSalePriceHint();
}

function updateSalePriceHint() {
  const attarId = parseInt(saleAttarSelect.value, 10);
  const attar = attars.find((a) => a.id === attarId);
  if (!attar) {
    salePriceHint.textContent = "";
    return;
  }
  saleUnitPriceInput.value = attar.sellingPrice;
  salePriceHint.textContent = `Default selling price: ${attar.sellingPrice.toFixed(
    2
  )}`;
}

saleAttarSelect.addEventListener("change", updateSalePriceHint);

// Handle sale form submit
saleForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const attarId = parseInt(saleAttarSelect.value, 10);
  const attar = attars.find((a) => a.id === attarId);
  if (!attar) {
    alert("Please select a valid attar.");
    return;
  }

  const quantity = parseInt(saleQtyInput.value, 10);
  const unitPrice = parseFloat(saleUnitPriceInput.value);

  if (isNaN(quantity) || quantity <= 0) {
    alert("Quantity must be a positive number.");
    return;
  }
  if (quantity > attar.quantity) {
    alert("Not enough stock available.");
    return;
  }
  if (isNaN(unitPrice) || unitPrice < 0) {
    alert("Unit price must be a valid amount.");
    return;
  }

  const totalPrice = quantity * unitPrice;
  const date = new Date().toISOString(); // ISO timestamp

  const newId = sales.length > 0 ? Math.max(...sales.map((s) => s.id)) + 1 : 1;

  const sale = {
    id: newId,
    attarId,
    attarName: attar.name,
    quantity,
    unitPrice,
    totalPrice,
    date,
  };

  // Update stock
  attar.quantity -= quantity;

  sales.push(sale);
  saveData(STORAGE_KEYS.SALES, sales);
  saveData(STORAGE_KEYS.ATTARS, attars);

  renderAttars();
  renderSales();
  fillSaleAttarOptions();

  saleQtyInput.value = "";
});

// ======== Sales table ========
function renderSales() {
  salesTableBody.innerHTML = "";

  if (sales.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.textContent = "No sales recorded yet.";
    tr.appendChild(td);
    salesTableBody.appendChild(tr);
    totalRevenueSpan.textContent = "0.00";
    return;
  }

  // Sort by newest first
  const sorted = [...sales].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let totalRevenue = 0;

  sorted.forEach((sale) => {
    const tr = document.createElement("tr");

    const dateTd = document.createElement("td");
    const date = new Date(sale.date);
    dateTd.textContent = date.toLocaleString();

    const attarTd = document.createElement("td");
    attarTd.textContent = sale.attarName;

    const qtyTd = document.createElement("td");
    qtyTd.textContent = sale.quantity;

    const unitTd = document.createElement("td");
    unitTd.textContent = sale.unitPrice.toFixed(2);

    const totalTd = document.createElement("td");
    totalTd.textContent = sale.totalPrice.toFixed(2);

    tr.appendChild(dateTd);
    tr.appendChild(attarTd);
    tr.appendChild(qtyTd);
    tr.appendChild(unitTd);
    tr.appendChild(totalTd);

    salesTableBody.appendChild(tr);

    totalRevenue += sale.totalPrice;
  });

  totalRevenueSpan.textContent = totalRevenue.toFixed(2);
}
