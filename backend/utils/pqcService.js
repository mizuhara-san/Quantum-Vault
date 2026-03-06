const crypto = require('node:crypto');

// ─────────────────────────────────────────────────────────────
// NOTE ON NODE.JS v24 API
// Key type: 'ml-kem-768' (not 'ml-kem' + { length: 768 })
// encapsulate() returns: { sharedKey, ciphertext }  (NOT sharedSecret)
// decapsulate() returns: Buffer (the shared key directly)
// ─────────────────────────────────────────────────────────────

// Generate Post-Quantum ML-KEM-768 Key Pair (NIST FIPS 203)
const generateQuantumKeyPair = () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ml-kem-768');

  return {
    publicKey: publicKey.export({ type: 'spki', format: 'pem' }),
    privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' })
  };
};

// Encapsulate: Generate a shared key + ciphertext using the recipient's public key.
// The ciphertext is stored in MongoDB. The sharedKey is the AES key material (never stored).
const encapsulateSecret = (publicKeyPem) => {
  const publicKey = crypto.createPublicKey(publicKeyPem);
  const { sharedKey, ciphertext } = crypto.encapsulate(publicKey);
  // Normalise to sharedSecret for backward compat with vaultController
  return { sharedSecret: sharedKey, ciphertext };
};

// Decapsulate: Recover the shared key using the private key + stored ML-KEM ciphertext.
// Returns a Buffer identical to the sharedKey produced during encapsulation.
const decapsulateSecret = (privateKeyPem, ciphertextHex) => {
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  const ciphertext = Buffer.from(ciphertextHex, 'hex');
  return crypto.decapsulate(privateKey, ciphertext);
  // Returns Buffer (the shared key — same bytes as encapsulation produced)
};

module.exports = { generateQuantumKeyPair, encapsulateSecret, decapsulateSecret };