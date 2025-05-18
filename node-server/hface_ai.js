const axios = require("axios");

async function generateImage(prompt) {
  const response = await axios.post(
    "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2",
    { inputs: prompt },
    {
      headers: {
        Authorization: `Bearer YOUR_HUGGINGFACE_API_KEY`,
        Accept: "application/json"
      },
      responseType: "arraybuffer",
    }
  );
  require("fs").writeFileSync("output.png", response.data);
  console.log("Image saved as output.png");
}

generateImage("A futuristic city at sunset, sci-fi style");
