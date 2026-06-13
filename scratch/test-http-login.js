const axios = require("axios");

async function main() {
  try {
    const res = await axios.post("https://voc-ortho.samriddhianveshana.com/api/auth/login", {
      username: "admin",
      password: "admin123",
      role: "Admin"
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });
    console.log("Status:", res.status);
    console.log("Data:", res.data);
  } catch (error) {
    if (error.response) {
      console.log("Error Status:", error.response.status);
      console.log("Error Headers:", error.response.headers);
      console.log("Error Data (first 500 chars):", String(error.response.data).substring(0, 500));
    } else {
      console.error("Network / Axios Error:", error.message);
    }
  }
}

main();
