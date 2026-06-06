const jwt = require("jsonwebtoken");

const token = jwt.sign({ username: "test", role: "ADMIN" }, "fallback_secret_key");

(async () => {
  try {
    const res = await fetch("http://localhost:5000/api/billing", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        patientName: "Test Patient",
        opNumber: "TEST-OP-1",
        items: [{ serviceName: "Test", amount: 100 }],
        paymentMode: "Cash",
        status: "Paid"
      })
    });
    console.log("Status:", res.status);
    if (res.ok) {
        const data = await res.json();
        console.log("Bill created:", data);
    } else {
        console.log("Response text:", await res.text());
    }
  } catch(e) {
    console.error("Fetch Error:", e.message);
  }
})();
