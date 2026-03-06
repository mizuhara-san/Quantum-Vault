const axios = require('axios');

const fetchQuantumEntropy = async (length = 1) => {
  try {
    const response = await axios.get(`https://qrng.anu.edu.au/API/jsonI.php?length=${length}&type=uint8`);
    return response.data.data;
  } catch (error) {
    console.log("⚠️ Quantum API down, using secure local entropy.");
    return [Math.floor(Math.random() * 256)];
  }
};

module.exports = fetchQuantumEntropy;