const jwt = require("jsonwebtoken");

const token = jwt.sign({ username: "test", role: "ADMIN" }, "fallback_secret_key");

(async () => {
  try {
    const res = await fetch("http://localhost:5000/api/billing/unbilled", {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Status:", res.status);
    if (res.ok) {
        const data = await res.json();
        console.log("Data length:", data.length);
    } else {
        console.log("Response text:", await res.text());
    }
  } catch(e) {
    console.error("Fetch Error:", e.message);
  }
})();
