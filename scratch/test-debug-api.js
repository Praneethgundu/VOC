const axios = require("axios");

async function main() {
  console.log("Checking debug API endpoint...");
  try {
    const res = await axios.get("https://voc-ortho.samriddhianveshana.com/api/debug-db", {
      headers: {
        "Cache-Control": "no-cache"
      }
    });
    console.log("Status:", res.status);
    console.log("Data:", res.data);
  } catch (error) {
    if (error.response) {
      console.log("Error Status:", error.response.status);
      console.log("Error Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Network/Axios Error:", error.message);
    }
  }
}

main();
