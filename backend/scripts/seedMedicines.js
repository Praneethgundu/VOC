const path = require("path");
const crypto = require("crypto");
const ExcelJS = require("exceljs");

const inventoryColumns = [
  { header: "Medicine ID", key: "medicineId", width: 20 },
  { header: "Medicine Name", key: "medicineName", width: 30 },
  { header: "Category", key: "category", width: 20 },
  { header: "Quantity", key: "quantity", width: 15 },
  { header: "Price", key: "price", width: 15 },
  { header: "Expiry Date", key: "expiryDate", width: 20 },
  { header: "Created At", key: "createdAt", width: 25 },
];

const medicines = [
  { name: "Paracetamol 500mg", cat: "Analgesic", price: 5, qty: 500 },
  { name: "Calcium + Vit D3", cat: "Supplement", price: 15, qty: 300 },
  { name: "Ibuprofen 400mg", cat: "NSAID", price: 10, qty: 400 },
  { name: "Diclofenac Gel", cat: "Topical Analgesic", price: 85, qty: 150 },
  { name: "Tramadol 50mg", cat: "Analgesic", price: 20, qty: 200 },
  { name: "Etoricoxib 90mg", cat: "NSAID", price: 25, qty: 250 },
  { name: "Glucosamine Chondroitin", cat: "Supplement", price: 150, qty: 100 },
  { name: "Pregabalin 75mg", cat: "Neuropathic Pain", price: 30, qty: 180 },
  { name: "Methylcobalamin 1500mcg", cat: "Vitamin", price: 40, qty: 300 },
  { name: "Aceclofenac 100mg", cat: "NSAID", price: 12, qty: 450 },
  { name: "Pantoprazole 40mg", cat: "Antacid", price: 8, qty: 500 },
  { name: "Amoxicillin 500mg", cat: "Antibiotic", price: 22, qty: 350 },
  { name: "Cefuroxime 500mg", cat: "Antibiotic", price: 45, qty: 200 },
  { name: "Metronidazole 400mg", cat: "Antibiotic", price: 10, qty: 250 },
  { name: "Serratiopeptidase 10mg", cat: "Anti-inflammatory", price: 15, qty: 300 },
  { name: "Chlorzoxazone 500mg", cat: "Muscle Relaxant", price: 18, qty: 250 },
  { name: "Thiocolchicoside 4mg", cat: "Muscle Relaxant", price: 35, qty: 200 },
  { name: "Ondansetron 4mg", cat: "Antiemetic", price: 12, qty: 150 },
  { name: "Rabeprazole 20mg", cat: "Antacid", price: 14, qty: 400 },
  { name: "Lignocaine 2% Injection", cat: "Local Anesthetic", price: 25, qty: 50 },
  { name: "Ketorolac 30mg Injection", cat: "NSAID", price: 15, qty: 100 },
  { name: "Methylprednisolone 40mg", cat: "Corticosteroid", price: 40, qty: 80 },
  { name: "Triamcinolone Injection", cat: "Corticosteroid", price: 60, qty: 50 },
  { name: "Bupivacaine 0.5% Injection", cat: "Local Anesthetic", price: 30, qty: 60 },
  { name: "Hyaluronic Acid Injection", cat: "Supplement", price: 2500, qty: 20 },
  { name: "Tizanidine 2mg", cat: "Muscle Relaxant", price: 10, qty: 200 },
  { name: "Piroxicam 20mg", cat: "NSAID", price: 15, qty: 150 },
  { name: "Meloxicam 15mg", cat: "NSAID", price: 20, qty: 180 },
  { name: "Ketoprofen Gel", cat: "Topical Analgesic", price: 70, qty: 100 },
  { name: "Ciprofloxacin 500mg", cat: "Antibiotic", price: 18, qty: 250 },
  { name: "Linezolid 600mg", cat: "Antibiotic", price: 120, qty: 80 },
  { name: "Gabapentin 300mg", cat: "Neuropathic Pain", price: 25, qty: 150 },
  { name: "Duloxetine 20mg", cat: "Antidepressant/Pain", price: 22, qty: 120 },
  { name: "Vitamin C 500mg", cat: "Supplement", price: 5, qty: 600 },
  { name: "Zincovit Tablet", cat: "Multivitamin", price: 10, qty: 400 },
  { name: "Dexamethasone 4mg", cat: "Corticosteroid", price: 5, qty: 300 },
  { name: "Deflazacort 6mg", cat: "Corticosteroid", price: 45, qty: 150 },
  { name: "Leflunomide 20mg", cat: "DMARD", price: 35, qty: 100 },
  { name: "Methotrexate 10mg", cat: "DMARD", price: 25, qty: 100 },
  { name: "Hydroxychloroquine 200mg", cat: "DMARD", price: 30, qty: 120 }
];

async function seed() {
  const filePath = path.join(__dirname, "../src/data/inventory.xlsx");
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Inventory");
  sheet.columns = inventoryColumns;

  medicines.forEach(m => {
    const medicineId = "MED-" + crypto.randomBytes(3).toString("hex").toUpperCase();
    const expiry = "2026-" + String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    sheet.addRow({
      medicineId,
      medicineName: m.name,
      category: m.cat,
      quantity: m.qty,
      price: m.price,
      expiryDate: expiry,
      createdAt: new Date().toISOString()
    });
  });

  await workbook.xlsx.writeFile(filePath);
  console.log("Seeded 40 medicines successfully to", filePath);
}

seed().catch(console.error);
