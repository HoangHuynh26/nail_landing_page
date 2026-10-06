import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// MIME type to extension mapping
const mimeToExt = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};

// Multer disk storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = mimeToExt[file.mimetype] || '.bin';
    const cleanBase = path.basename(file.originalname, path.extname(file.originalname)).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e4)}`;
    cb(null, `promo-${cleanBase}-${uniqueSuffix}${ext}`);
  }
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
  if (mimeToExt[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image file format. Supported: JPG, PNG, WEBP, GIF'), false);
  }
};

export const uploadPromotionImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Multer disk storage for gallery showcases
const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = mimeToExt[file.mimetype] || '.bin';
    const cleanBase = path.basename(file.originalname, path.extname(file.originalname)).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e4)}`;
    cb(null, `gallery-${cleanBase}-${uniqueSuffix}${ext}`);
  }
});

export const uploadGalleryImage = multer({
  storage: galleryStorage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB
  }
});



// Verify file signature (magic numbers) to ensure uploaded file is actually an image
export const verifyImageSignature = (req, res, next) => {
  if (!req.file) return next();
  
  try {
    const buffer = Buffer.alloc(4);
    const fd = fs.openSync(req.file.path, 'r');
    fs.readSync(fd, buffer, 0, 4, 0);
    fs.closeSync(fd);
    
    const hex = buffer.toString('hex').toUpperCase();
    
    // Magic numbers
    const isJpeg = hex.startsWith('FFD8FF');
    const isPng = hex.startsWith('89504E47');
    const isWebp = hex.startsWith('52494646'); // RIFF...WEBP is more complex, usually starts with RIFF
    const isGif = hex.startsWith('47494638');
    
    let valid = isJpeg || isPng || isGif;
    
    if (!valid && isWebp) {
       // Deep check for WEBP
       const webpBuffer = Buffer.alloc(12);
       const fdWebp = fs.openSync(req.file.path, 'r');
       fs.readSync(fdWebp, webpBuffer, 0, 12, 0);
       fs.closeSync(fdWebp);
       if (webpBuffer.toString('utf8', 8, 12) === 'WEBP') {
          valid = true;
       }
    }
    
    if (!valid) {
       // Delete invalid file
       fs.unlinkSync(req.file.path);
       return res.status(400).json({ success: false, message: 'Invalid image file signature. File rejected for security reasons.' });
    }
    
    next();
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({ success: false, message: 'Error verifying file contents' });
  }
};
