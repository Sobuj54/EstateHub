import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ensure uploads dir exists (run once at module load)
const ROOT_DIR = path.resolve(process.cwd());
export const UPLOAD_DIR = path.join(ROOT_DIR, 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|avif/;
    const extensionName = filetypes.test(
      path.extname(file.originalname).toLocaleLowerCase()
    );
    const mimeType = filetypes.test(file.mimetype);

    if (extensionName && mimeType) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `File type ${mimeType} not allowed. Allowed types: jpeg,jpg,png,avif .`
        )
      );
    }
  },
});

/*
file:
{
  fieldname: 'avatar',
  originalname: '20251030_011857.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  destination: 'uploads/',
  filename: '1764862322974-461340383-20251030_011857.jpg',
  path: 'uploads\\1764862322974-461340383-20251030_011857.jpg',
  size: 441202
}

*/
