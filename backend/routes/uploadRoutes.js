/**
 * @route   POST /api/products
 * @desc    Create new product (Admin/Seller only)
 * @access  Private
 */
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import streamifier from 'streamifier';
import { v2 as cloudinary } from 'cloudinary';

const uploadRouter = express.Router();


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // עד 8MB
});


const hasCloudinary =
  !!process.env.CLOUDINARY_URL ||
  (!!process.env.CLOUDINARY_CLOUD_NAME && !!process.env.CLOUDINARY_API_KEY && !!process.env.CLOUDINARY_API_SECRET);

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}


const ensureLocalUploadsDir = () => {
  const dir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

uploadRouter.post(
  '/',
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded' });
      }


      if (hasCloudinary) {
        const bufferStream = streamifier.createReadStream(req.file.buffer);
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'urbanbazaar' },
            (error, uploadResult) => (error ? reject(error) : resolve(uploadResult))
          );
          bufferStream.pipe(stream);
        });
        return res.send({ url: result.secure_url });
      }

 
      const uploadsDir = ensureLocalUploadsDir();
      const filename = `${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, req.file.buffer);
     
      const publicUrl = `/uploads/${filename}`;
      return res.send({ url: publicUrl });
    } catch (err) {
      console.error('[UPLOAD] Failed:', err);
      res.status(500).send({ message: err.message || 'Upload failed' });
    }
  }
);

export default uploadRouter;