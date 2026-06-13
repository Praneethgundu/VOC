const axios = require("axios");

async function main() {
  try {
    const res = await axios.get("https://voc-ortho.samriddhianveshana.com/api/auth/profile", {
      headers: {
        "Cache-Control": "no-cache"
      }
    });
    console.log("Status:", res.status);
    console.log("Data:", res.data);
  } catch (error) {
    if (error.response) {
      console.log("Error Status:", error.response.status);
      console.log("Error Data:", String(error.response.data).substring(0, 300));
    } else {
      console.error("Network/Axios Error:", error.message);
    }
  }
}

main();
