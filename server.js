const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Ensure the 'uploads' folder exists. If not, create it.
const uploadDirectory = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory);
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory); // Save files in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        // Use the original filename with a timestamp to prevent overwrites
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// File filter to only allow specific file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // Allow the file
    } else {
        cb(new Error('Unsupported file type'), false); // Reject the file
    }
};

// Multer setup with storage and file filter
const upload = multer({ storage, fileFilter });

// Handle the file upload POST request at the '/upload' endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded or invalid file type.');
    }
    res.status(200).json({ filename: req.file.filename });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});