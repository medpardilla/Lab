const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Ensure the 'uploads' folder exists
const uploadDirectory = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory); // Save files in 'uploads' folder
  },
  filename: (req, file, cb) => {
    // Save files with a timestamp prefix to avoid overwriting
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// File filter to only allow specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Allow file
  } else {
    cb(new Error('Unsupported file type'), false); // Reject file
  }
};

// Multer setup with storage and file filter
const upload = multer({ storage, fileFilter });

// Route to serve the upload form HTML (optional for testing)
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

// Handle file upload POST request
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded or invalid file type.');
  }
  res.status(200).send(`File uploaded successfully: ${req.file.filename}`);
});

// Handle other routes (optional)
app.use((req, res) => {
  res.status(404).send('<h1>404 - File Not Found</h1>');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
