import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/documents');

if (!fs.existsSync(uploadDir)) {
         fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
         destination(req, file, cb) {
                  cb(null, uploadDir);
         },
         filename(req, file, cb) {
                  cb(
                           null,
                           `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
                  );
         },
});

function checkFileType(file, cb) {
         const filetypes = /jpg|jpeg|png|pdf/;
         const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
         const mimetype = filetypes.test(file.mimetype);

         if (extname && mimetype) {
                  return cb(null, true);
         } else {
                  cb('Images and PDFs only!');
         }
}

const upload = multer({
         storage,
         fileFilter: function (req, file, cb) {
                  checkFileType(file, cb);
         },
});

export default upload;
