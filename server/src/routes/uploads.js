/**
 * Uploads route — accepts multipart/form-data and stores files locally
 * Optionally uploads to S3 when AWS env vars are present.
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) { cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_')}`); }
});

const upload = multer({ storage });

// POST /uploads -> { url }
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
    // If S3 configured, upload
    if (process.env.S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      const AWS = require('aws-sdk');
      const s3 = new AWS.S3({ region: process.env.S3_REGION || 'us-east-1' });
      const fileContent = fs.readFileSync(req.file.path);
      const key = `uploads/${path.basename(req.file.path)}`;
      const params = { Bucket: process.env.S3_BUCKET, Key: key, Body: fileContent, ACL: 'public-read', ContentType: req.file.mimetype };
      const data = await s3.upload(params).promise();
      // remove local file
      fs.unlinkSync(req.file.path);
      return res.json({ success: true, url: data.Location });
    }

    // Return local URL
    const url = `/uploads/${path.basename(req.file.path)}`;
    res.json({ success: true, url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

module.exports = router;
