// 1) Paste your VRR "Create visitor parking" STEP 1 link here
// (the page where you type Apartment Name)
const VRR_STEP1_URL = "https://app.vrrparking.com/visitors";

// Storage: saves on the visitor's phone only
const STORAGE_KEY = "vrr_quick_register_v3";

// Inputs
const aptEl = document.getElementById("apt");
const residentEl = document.getElementById("resident");
const unitEl = document.getElementById("unit");

const plateEl = document.getElementById("plate");
const stateEl = document.getElementById("state");
const makeEl = document.getElementById("make");
const modelEl = document.getElementById("model");

const visitorNameEl = document.getElementById("visitorName");
const visitorEmailEl = document.getElementById("visitorEmail");
const visitorPhoneEl = document.getElementById("visitorPhone");

// Top text
const aptText = document.getElementById("aptText");
const residentText = document.getElementById("residentText");
const unitText = document.getElementById("unitText");

// Buttons
document.getElementById("saveBtn").addEventListener("click", saveAll);
document.getElementById("clearBtn").addEventListener("click", clearAll);
document.getElementById("openStep1Btn").addEventListener("click", openVRRStep1AndCopyApt);
document.getElementById("copyStep2Btn").addEventListener("click", copyStep2Fields);

const statusEl = document.getElementById("status");

// Read QR parameters, example:
// https://YOUR-LINK/?apt=Hebron%20121%20Station&resident=Martin&unit=101
const params = new URLSearchParams(window.location.search);

function setStatus(msg, ok = false) {
  statusEl.textContent = msg;
  statusEl.className = ok ? "status ok" : "status";
}

function refreshTop() {
  aptText.textContent = aptEl.value || "—";
  residentText.textContent = residentEl.value || "—";
  unitText.textContent = unitEl.value || "—";
}

function loadFromQR() {
  const apt = params.get("apt");
  const resident = params.get("resident");
  const unit = params.get("unit");

  if (apt) aptEl.value = apt;
  if (resident) residentEl.value = resident;
  if (unit) unitEl.value = unit;

  refreshTop();
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);

    // QR values win if present, otherwise load saved ones
    if (!aptEl.value) aptEl.value = d.apt || "";
    if (!residentEl.value) residentEl.value = d.resident || "";
    if (!unitEl.value) unitEl.value = d.unit || "";

    plateEl.value = d.plate || "";
    stateEl.value = d.state || "";
    makeEl.value = d.make || "";
    modelEl.value = d.model || "";
    visitorNameEl.value = d.visitorName || "";
    visitorEmailEl.value = d.visitorEmail || "";
    visitorPhoneEl.value = d.visitorPhone || "";

    refreshTop();
    setStatus("Loaded saved info from this phone.", true);
  } catch {}
}

function normalizeState() {
  stateEl.value = (stateEl.value || "").trim().toUpperCase();
}

function saveAll() {
  normalizeState();

  const data = {
    apt: (aptEl.value || "").trim(),
    resident: (residentEl.value || "").trim(),
    unit: (unitEl.value || "").trim(),

    plate: (plateEl.value || "").trim(),
    state: (stateEl.value || "").trim(),
    make: (makeEl.value || "").trim(),
    model: (modelEl.value || "").trim(),

    visitorName: (visitorNameEl.value || "").trim(),
    visitorEmail: (visitorEmailEl.value || "").trim(),
    visitorPhone: (visitorPhoneEl.value || "").trim()
  };

  // Basic required checks based on your screenshot Step 2
  if (!data.apt) return setStatus("Enter Apartment name (Step 1).");
  if (!data.plate) return setStatus("Enter License plate (Step 2).");
  if (!data.make) return setStatus("Enter Vehicle make (Step 2).");
  if (!data.model) return setStatus("Enter Vehicle model (Step 2).");
  if (!data.resident) return setStatus("Enter Resident name (Step 2).");
  if (!data.unit) return setStatus("Enter Unit number (Step 2).");
  if (!data.visitorName) return setStatus("Enter Visitor name (Step 2).");
  if (!data.visitorEmail) return setStatus("Enter Visitor email (Step 2).");

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  refreshTop();
  setStatus("Saved! Next time this phone will auto-fill.", true);
}

function clearAll() {
  localStorage.removeItem(STORAGE_KEY);

  // keep QR-provided values (apt/resident/unit) if they exist
  aptEl.value = params.get("apt") || "";
  residentEl.value = params.get("resident") || "";
  unitEl.value = params.get("unit") || "";

  plateEl.value = "";
  stateEl.value = "";
  makeEl.value = "";
  modelEl.value = "";
  visitorNameEl.value = "";
  visitorEmailEl.value = "";
  visitorPhoneEl.value = "";

  refreshTop();
  setStatus("Cleared saved info from this phone.");
}

async function copyToClipboard(label, text) {
  if (!text) return setStatus(`Nothing to copy for: ${label}`);
  try {
    await navigator.clipboard.writeText(text);
    setStatus(`Copied ${label}.`, true);
  } catch {
    setStatus(`Copy failed for ${label}. You can tap and hold to copy.`);
  }
}

// Button 1: open VRR Step 1 + copy apartment name
function openVRRStep1AndCopyApt() {
  if (VRR_STEP1_URL.includes("PASTE_YOUR_VRR_STEP1_LINK_HERE")) {
    return setStatus("Paste your VRR Step 1 link into VRR_STEP1_URL first.");
  }
  const apt = (aptEl.value || "").trim();
  if (!apt) return setStatus("Enter Apartment name first.");

  window.open(VRR_STEP1_URL, "_blank");
  copyToClipboard("Apartment name (paste into Step 1)", apt);
}

// Button 2: copy Step 2 fields in the order VRR asks for them
async function copyStep2Fields() {
  normalizeState();

  const plate = (plateEl.value || "").trim();
  const make = (makeEl.value || "").trim();
  const model = (modelEl.value || "").trim();
  const resident = (residentEl.value || "").trim();
  const unit = (unitEl.value || "").trim();
  const vname = (visitorNameEl.value || "").trim();
  const vemail = (visitorEmailEl.value || "").trim();
  const vphone = (visitorPhoneEl.value || "").trim();

  if (!plate) return setStatus("Enter license plate first.");

  // A simple “cheat sheet” the visitor can paste into Notes or keep on clipboard.
  // They will still paste values into each VRR field.
  const text =
`LICENSE PLATE: ${plate}
CONFIRM PLATE: ${plate}
VEHICLE MAKE: ${make}
VEHICLE MODEL: ${model}

RESIDENT NAME: ${resident}
UNIT NUMBER: ${unit}

VISITOR NAME: ${vname}
VISITOR EMAIL: ${vemail}
VISITOR PHONE: ${vphone || "(optional)"}`;

  await copyToClipboard("Step 2 fields", text);
}

// Startup
loadFromQR();
loadFromStorage();
refreshTop();
