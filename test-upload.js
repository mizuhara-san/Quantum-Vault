require('dotenv').config({ path: './backend/.env' });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const encryptedBuffer = Buffer.from('hello world');

const uploadResult = new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'quantum-vault' },
        (error, result) => {
            if (error) {
                console.error('Upload Error:', error);
                reject(error);
            } else {
                console.log('Upload Result:', result);
                resolve(result);
            }
        }
    ).end(encryptedBuffer);
});

uploadResult.catch(console.error);
