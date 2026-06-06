const ExcelJS = require('exceljs');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, "../data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helpers
const getFilePath = (filename) => path.join(DATA_DIR, filename);

const getRandomDate = (startDaysAgo, endDaysAgo) => {
  const date = new Date();
  const diff = startDaysAgo - endDaysAgo;
  const randomDays = Math.floor(Math.random() * diff) + endDaysAgo;
  date.setDate(date.getDate() - randomDays);
  return date.toISOString();
};

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Mock Data Sets
const firstNames = ["Aarav", "Vihaan", "Aditya", "Sai", "Arjun", "Krishna", "Rohan", "Ananya", "Diya", "Saanvi", "Neha", "Priya", "Kavya", "Ishita", "Rahul", "Vikram", "Sneha", "Karan", "Pooja", "Ravi", "Suresh", "Ramesh", "Gita", "Sunita"];
const lastNames = ["Reddy", "Sharma", "Patel", "Singh", "Kumar", "Rao", "Naidu", "Chowdary", "Nair", "Menon", "Iyer", "Gowda"];
const doctors = ["Dr. Sharma", "Dr. Reddy", "Dr. Patel"];
const departments = ["Orthopaedics", "General Medicine", "Physiotherapy"];
const bloodGroups = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];

const investigationTypes = [
  { name: "X-Ray Knee AP/Lat", price: 400 },
  { name: "X-Ray Cervical Spine", price: 450 },
  { name: "X-Ray Lumbar Spine", price: 450 },
  { name: "MRI Knee Joint", price: 3500 },
  { name: "MRI Cervical Spine", price: 4000 },
  { name: "CT Scan Joints", price: 2500 },
  { name: "Serum Uric Acid", price: 200 },
  { name: "Serum Calcium", price: 250 },
  { name: "CRP (C-Reactive Protein)", price: 400 }
];

const otProcedures = ["TKR (Total Knee Replacement)", "Arthroscopy", "Fracture Fixation", "Spinal Fusion", "Carpal Tunnel Release"];

const medicineData = [
  { name: "Paracetamol 500mg", category: "Analgesic", price: 2 },
  { name: "Ibuprofen 400mg", category: "NSAID", price: 3 },
  { name: "Diclofenac Gel", category: "Topical NSAID", price: 85 },
  { name: "Calcium + Vit D3", category: "Supplement", price: 15 },
  { name: "Amoxicillin 500mg", category: "Antibiotic", price: 8 },
  { name: "Pantoprazole 40", category: "Antacid", price: 5 },
  { name: "Tramadol 50mg", category: "Analgesic", price: 12 },
  { name: "Pregabalin 75mg", category: "Nerve Pain", price: 20 },
  { name: "Methylcobalamin", category: "Supplement", price: 18 },
  { name: "Aceclofenac 100mg", category: "NSAID", price: 4 }
];

async function generateData() {
  console.log("Starting Demo Data Generation...");

  const patients = [];
  const consultations = [];
  const investigations = [];
  const otRecords = [];
  const inventory = [];
  const dispensed = [];
  const bills = [];

  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Generate Inventory (50 items)
  for (let i = 0; i < 50; i++) {
    const medTemplate = medicineData[i % medicineData.length];
    const modifier = Math.floor(i / medicineData.length);
    const mName = modifier > 0 ? `${medTemplate.name} Variant ${modifier}` : medTemplate.name;
    
    // Some low stock, some out of stock
    let qty = randomInt(50, 500);
    if (i % 10 === 0) qty = randomInt(0, 5); // Low stock
    if (i === 5) qty = 0; // Out of stock

    inventory.push({
      medicineId: "MED-" + crypto.randomBytes(3).toString("hex").toUpperCase(),
      medicineName: mName,
      category: medTemplate.category,
      quantity: qty,
      price: medTemplate.price + randomInt(-1, 5),
      expiryDate: new Date(new Date().setMonth(new Date().getMonth() + randomInt(1, 24))).toISOString().split("T")[0],
      createdAt: new Date().toISOString()
    });
  }

  // 2. Generate Patients (120 patients)
  for (let i = 0; i < 120; i++) {
    const isToday = i < 40; // 40 patients created today
    const date = isToday ? new Date().toISOString() : getRandomDate(30, 1);
    
    patients.push({
      id: "PAT-" + crypto.randomBytes(4).toString("hex").toUpperCase(),
      opNumber: "OP" + String(1000 + i).padStart(6, '0'),
      name: `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`,
      age: randomInt(10, 85),
      gender: getRandomItem(["Male", "Female"]),
      phone: "9" + String(Math.floor(Math.random() * 1000000000)).padStart(9, '0'),
      bloodGroup: getRandomItem(bloodGroups),
      department: getRandomItem(departments),
      assignedDoctor: getRandomItem(doctors),
      createdAt: date
    });
  }

  // Generate specific scenario patients manually
  const patA = {
    id: "PAT-" + crypto.randomBytes(4).toString("hex").toUpperCase(),
    opNumber: "OP" + String(2000).padStart(6, '0'),
    name: "Scenario A Patient",
    age: 45, gender: "Male", phone: "9000000001", bloodGroup: "O+",
    department: "Orthopaedics", assignedDoctor: "Dr. Sharma", createdAt: new Date().toISOString()
  };
  const patB = {
    id: "PAT-" + crypto.randomBytes(4).toString("hex").toUpperCase(),
    opNumber: "OP" + String(2001).padStart(6, '0'),
    name: "Scenario B Patient",
    age: 60, gender: "Female", phone: "9000000002", bloodGroup: "A+",
    department: "Orthopaedics", assignedDoctor: "Dr. Reddy", createdAt: new Date().toISOString()
  };
  const patC = {
    id: "PAT-" + crypto.randomBytes(4).toString("hex").toUpperCase(),
    opNumber: "OP" + String(2002).padStart(6, '0'),
    name: "Scenario C Patient",
    age: 55, gender: "Male", phone: "9000000003", bloodGroup: "B+",
    department: "Orthopaedics", assignedDoctor: "Dr. Patel", createdAt: new Date().toISOString()
  };
  patients.push(patA, patB, patC);

  // 3. Generate Consultations
  const allPatients = [...patients];
  // Generate 80 consultations for recent patients
  for (let i = 0; i < 80; i++) {
    const p = allPatients[i];
    const isToday = i < 30; // 30 consultations today
    const date = isToday ? new Date().toISOString() : p.createdAt;
    
    // Status mix
    let status = "Completed";
    if (i % 10 === 0) status = "Waiting";
    else if (i % 7 === 0) status = "In Progress";

    consultations.push({
      id: "CONS-" + crypto.randomBytes(3).toString("hex").toUpperCase(),
      patientId: p.id,
      patientName: p.name,
      opNumber: p.opNumber,
      doctor: p.assignedDoctor,
      department: p.department,
      status: status,
      consultationDate: date,
      vitals: JSON.stringify({ bp: "120/80", pulse: "75", weight: "70", temp: "98.6" }),
      complaints: status === "Waiting" ? "Knee pain" : "Chronic knee pain for 2 weeks",
      diagnosis: status === "Completed" ? "Mild Osteoarthritis" : "",
      investigations: status === "Completed" ? JSON.stringify(["X-Ray Knee AP/Lat"]) : "[]",
      medicines: status === "Completed" ? JSON.stringify([{ name: "Paracetamol 500mg", dosage: "1-0-1", days: 5 }]) : "[]",
      notes: "Advised rest and hot fomentation"
    });
  }

  // Scenario A: Registration -> Consultation -> X-Ray -> Billing (Paid)
  const consA = {
    id: "CONS-A1", patientId: patA.id, patientName: patA.name, opNumber: patA.opNumber, doctor: patA.assignedDoctor, department: patA.department, status: "Completed", consultationDate: new Date().toISOString(), vitals: "{}", complaints: "Joint pain", diagnosis: "Sprain", investigations: JSON.stringify(["X-Ray Knee AP/Lat"]), medicines: "[]", notes: ""
  };
  consultations.push(consA);
  investigations.push({
    id: "INV-A1", opNumber: patA.opNumber, patientName: patA.name, doctor: patA.assignedDoctor, testName: "X-Ray Knee AP/Lat", status: "COMPLETED", result: "Normal alignment", orderedDate: new Date().toISOString(), price: 400
  });
  bills.push({
    id: "BILL-A1", patientName: patA.name, opNumber: patA.opNumber, items: JSON.stringify([{ serviceName: "Consultation Fee", category: "Consultation", amount: 500 }, { serviceName: "X-Ray Knee AP/Lat", category: "Investigation", amount: 400 }]), total: 900, paymentMode: "Cash", status: "Paid", date: new Date().toISOString(), department: "General"
  });

  // Scenario B: Registration -> Consultation -> MRI -> Pharmacy -> Billing (Pending)
  const consB = {
    id: "CONS-B1", patientId: patB.id, patientName: patB.name, opNumber: patB.opNumber, doctor: patB.assignedDoctor, department: patB.department, status: "Completed", consultationDate: new Date().toISOString(), vitals: "{}", complaints: "Severe back pain", diagnosis: "Slipped Disc", investigations: JSON.stringify(["MRI Lumbar Spine"]), medicines: JSON.stringify([{ name: "Diclofenac Gel", dosage: "Local", days: 10 }]), notes: ""
  };
  consultations.push(consB);
  investigations.push({
    id: "INV-B1", opNumber: patB.opNumber, patientName: patB.name, doctor: patB.assignedDoctor, testName: "MRI Lumbar Spine", status: "PENDING", result: "", orderedDate: new Date().toISOString(), price: 4000
  });
  dispensed.push({
    id: "DISP-B1", opNumber: patB.opNumber, medicineId: inventory[2].medicineId, quantity: 1, amount: inventory[2].price, dispensedDate: new Date().toISOString()
  });
  inventory[2].quantity -= 1;
  bills.push({
    id: "BILL-B1", patientName: patB.name, opNumber: patB.opNumber, items: JSON.stringify([{ serviceName: "Consultation Fee", category: "Consultation", amount: 500 }, { serviceName: "MRI Lumbar Spine", category: "Investigation", amount: 4000 }, { serviceName: "Diclofenac Gel", category: "Pharmacy", amount: inventory[2].price }]), total: 4500 + inventory[2].price, paymentMode: "Pending", status: "Unpaid", date: new Date().toISOString(), department: "General"
  });

  // Scenario C: Registration -> Consultation -> OT Procedure -> Pharmacy -> Final Bill
  const consC = {
    id: "CONS-C1", patientId: patC.id, patientName: patC.name, opNumber: patC.opNumber, doctor: patC.assignedDoctor, department: patC.department, status: "Completed", consultationDate: new Date().toISOString(), vitals: "{}", complaints: "Meniscus tear", diagnosis: "Tear", investigations: "[]", medicines: "[]", notes: "Surgery planned"
  };
  consultations.push(consC);
  otRecords.push({
    id: "OT-C1", opNumber: patC.opNumber, patientName: patC.name, age: patC.age, procedure: "Arthroscopy", doctor: patC.assignedDoctor, date: todayStr, time: "10:00", fee: 25000, notes: "Successful", status: "COMPLETED"
  });
  dispensed.push({
    id: "DISP-C1", opNumber: patC.opNumber, medicineId: inventory[0].medicineId, quantity: 10, amount: inventory[0].price * 10, dispensedDate: new Date().toISOString()
  });
  inventory[0].quantity -= 10;
  bills.push({
    id: "BILL-C1", patientName: patC.name, opNumber: patC.opNumber, items: JSON.stringify([{ serviceName: "Consultation Fee", category: "Consultation", amount: 500 }, { serviceName: "OT: Arthroscopy", category: "Surgery", amount: 25000 }, { serviceName: "Pharmacy", category: "Pharmacy", amount: inventory[0].price * 10 }]), total: 25500 + (inventory[0].price * 10), paymentMode: "Card", status: "Paid", date: new Date().toISOString(), department: "General"
  });

  // Generate generic Investigations
  for (let i = 0; i < 40; i++) {
    const c = consultations[i];
    if (c && c.status === "Completed") {
      const isToday = i < 20;
      const invTemplate = getRandomItem(investigationTypes);
      investigations.push({
        id: "INV-" + crypto.randomBytes(3).toString("hex").toUpperCase(),
        opNumber: c.opNumber,
        patientName: c.patientName,
        doctor: c.doctor,
        testName: invTemplate.name,
        status: isToday ? getRandomItem(["PENDING", "IN PROGRESS", "COMPLETED"]) : "COMPLETED",
        result: "Details as per report.",
        orderedDate: c.consultationDate,
        price: invTemplate.price
      });
    }
  }

  // Generate generic OT Procedures
  for (let i = 0; i < 15; i++) {
    const p = patients[i + 50]; // skip first 50
    otRecords.push({
      id: "OT-" + crypto.randomBytes(3).toString("hex").toUpperCase(),
      opNumber: p.opNumber,
      patientName: p.name,
      age: p.age,
      procedure: getRandomItem(otProcedures),
      doctor: p.assignedDoctor,
      date: i < 5 ? todayStr : getRandomDate(10, 1).split("T")[0],
      time: "09:30",
      fee: randomInt(15000, 50000),
      notes: "Routine",
      status: i < 3 ? "SCHEDULED" : (i < 5 ? "IN PROGRESS" : "COMPLETED")
    });
  }

  // Generate generic Dispensing & Billing
  for (let i = 0; i < 50; i++) {
    const c = consultations[i + 10];
    if (c && c.status === "Completed") {
      // Dispense 1 random medicine
      const med = getRandomItem(inventory);
      if (med.quantity > 5) {
        const qty = randomInt(1, 5);
        dispensed.push({
          id: "DISP-" + crypto.randomBytes(4).toString("hex"),
          opNumber: c.opNumber,
          medicineId: med.medicineId,
          quantity: qty,
          amount: med.price * qty,
          dispensedDate: c.consultationDate
        });
        med.quantity -= qty;
      }

      // Generate Bill
      const isPaid = Math.random() > 0.3; // 70% paid
      bills.push({
        id: "BILL-" + crypto.randomBytes(3).toString("hex").toUpperCase(),
        patientName: c.patientName,
        opNumber: c.opNumber,
        items: JSON.stringify([{ serviceName: "Consultation Fee", category: "Consultation", amount: 500 }]),
        total: 500,
        paymentMode: isPaid ? getRandomItem(["Cash", "UPI", "Card"]) : "Pending",
        status: isPaid ? "Paid" : "Unpaid",
        date: c.consultationDate,
        department: "General"
      });
    }
  }

  // --- WRITING TO EXCEL FILES ---
  console.log("Saving to Excel files...");

  // PATIENTS
  const patWb = new ExcelJS.Workbook();
  const patSheet = patWb.addWorksheet("Patients");
  patSheet.columns = [
    { header: "ID", key: "id", width: 20 }, { header: "OP Number", key: "opNumber", width: 20 },
    { header: "Name", key: "name", width: 30 }, { header: "Age", key: "age", width: 10 },
    { header: "Gender", key: "gender", width: 15 }, { header: "Phone", key: "phone", width: 20 },
    { header: "Blood Group", key: "bloodGroup", width: 15 }, { header: "Department", key: "department", width: 25 },
    { header: "Assigned Doctor", key: "assignedDoctor", width: 25 }, { header: "Created At", key: "createdAt", width: 25 },
  ];
  patients.forEach(p => patSheet.addRow(p));
  await patWb.xlsx.writeFile(getFilePath("patients.xlsx"));

  // CONSULTATIONS
  const consWb = new ExcelJS.Workbook();
  const consSheet = consWb.addWorksheet("Consultations");
  consSheet.columns = [
    { header: "Consultation ID", key: "id", width: 20 }, { header: "Patient ID", key: "patientId", width: 20 },
    { header: "Patient Name", key: "patientName", width: 25 }, { header: "OP Number", key: "opNumber", width: 20 },
    { header: "Doctor", key: "doctor", width: 25 }, { header: "Department", key: "department", width: 25 },
    { header: "Status", key: "status", width: 15 }, { header: "Date", key: "consultationDate", width: 25 },
    { header: "Vitals", key: "vitals", width: 30 }, { header: "Complaints", key: "complaints", width: 40 },
    { header: "Diagnosis", key: "diagnosis", width: 30 }, { header: "Investigations", key: "investigations", width: 40 },
    { header: "Medicines", key: "medicines", width: 40 }, { header: "Notes", key: "notes", width: 50 },
  ];
  consultations.forEach(c => consSheet.addRow(c));
  await consWb.xlsx.writeFile(getFilePath("consultations.xlsx"));

  // INVESTIGATIONS
  const invWb = new ExcelJS.Workbook();
  const invSheet = invWb.addWorksheet("Investigations");
  invSheet.columns = [
    { header: "Test ID", key: "id", width: 20 }, { header: "OP Number", key: "opNumber", width: 20 },
    { header: "Patient Name", key: "patientName", width: 25 }, { header: "Doctor", key: "doctor", width: 25 },
    { header: "Test Name", key: "testName", width: 30 }, { header: "Status", key: "status", width: 15 },
    { header: "Result", key: "result", width: 40 }, { header: "Ordered Date", key: "orderedDate", width: 25 },
  ];
  investigations.forEach(i => invSheet.addRow(i));
  await invWb.xlsx.writeFile(getFilePath("investigations.xlsx"));

  // OT PROCEDURES
  const otWb = new ExcelJS.Workbook();
  const otSheet = otWb.addWorksheet("Procedures");
  otSheet.columns = [
    { header: "Procedure ID", key: "id", width: 20 }, { header: "OP Number", key: "opNumber", width: 20 },
    { header: "Patient Name", key: "patientName", width: 25 }, { header: "Age", key: "age", width: 10 },
    { header: "Procedure", key: "procedure", width: 30 }, { header: "Doctor", key: "doctor", width: 25 },
    { header: "Date", key: "date", width: 15 }, { header: "Time", key: "time", width: 15 },
    { header: "Fee", key: "fee", width: 15 }, { header: "Notes", key: "notes", width: 40 },
    { header: "Status", key: "status", width: 15 },
  ];
  otRecords.forEach(o => otSheet.addRow(o));
  await otWb.xlsx.writeFile(getFilePath("ot_procedures_v2.xlsx"));

  // PHARMACY INVENTORY
  const pharmInvWb = new ExcelJS.Workbook();
  const pharmInvSheet = pharmInvWb.addWorksheet("Inventory");
  pharmInvSheet.columns = [
    { header: "Medicine ID", key: "medicineId", width: 20 }, { header: "Medicine Name", key: "medicineName", width: 30 },
    { header: "Category", key: "category", width: 20 }, { header: "Quantity", key: "quantity", width: 15 },
    { header: "Price", key: "price", width: 15 }, { header: "Expiry Date", key: "expiryDate", width: 20 },
    { header: "Created At", key: "createdAt", width: 25 },
  ];
  inventory.forEach(i => pharmInvSheet.addRow(i));
  await pharmInvWb.xlsx.writeFile(getFilePath("inventory.xlsx"));

  // PHARMACY DISPENSED
  const pharmDispWb = new ExcelJS.Workbook();
  const pharmDispSheet = pharmDispWb.addWorksheet("Dispensed");
  pharmDispSheet.columns = [
    { header: "Dispense ID", key: "id", width: 20 }, { header: "Patient OP", key: "opNumber", width: 20 },
    { header: "Medicine ID", key: "medicineId", width: 20 }, { header: "Quantity Dispensed", key: "quantity", width: 20 },
    { header: "Total Amount", key: "amount", width: 15 }, { header: "Dispensed Date", key: "dispensedDate", width: 25 },
  ];
  dispensed.forEach(d => pharmDispSheet.addRow(d));
  await pharmDispWb.xlsx.writeFile(getFilePath("pharmacy.xlsx"));

  // BILLING
  const billWb = new ExcelJS.Workbook();
  const billSheet = billWb.addWorksheet("Billing");
  billSheet.columns = [
    { header: "Bill ID", key: "id", width: 20 }, { header: "Patient Name", key: "patientName", width: 25 },
    { header: "OP Number", key: "opNumber", width: 20 }, { header: "Bill Items", key: "items", width: 50 },
    { header: "Total", key: "total", width: 15 }, { header: "Payment Mode", key: "paymentMode", width: 15 },
    { header: "Status", key: "status", width: 15 }, { header: "Date", key: "date", width: 25 },
  ];
  bills.forEach(b => billSheet.addRow(b));
  await billWb.xlsx.writeFile(getFilePath("billing.xlsx"));

  console.log("Demo Data Generation Complete!");
}

generateData().catch(console.error);
