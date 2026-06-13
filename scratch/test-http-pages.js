const axios = require("axios");

async function checkUrl(url) {
  try {
    const res = await axios.get(url);
    console.log(`${url} -> Status: ${res.status}`);
  } catch (error) {
    if (error.response) {
      console.log(`${url} -> Error Status: ${error.response.status}`);
      console.log(`${url} -> Error Data (first 200 chars):`, String(error.response.data).substring(0, 200));
    } else {
      console.log(`${url} -> Axios Error: ${error.message}`);
    }
  }
}

async function main() {
  await checkUrl("https://voc-ortho.samriddhianveshana.com/");
  await checkUrl("https://voc-ortho.samriddhianveshana.com/login");
  await checkUrl("https://voc-ortho.samriddhianveshana.com/dashboard");
}

main();
