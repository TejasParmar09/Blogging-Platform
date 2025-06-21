const multer = require('multer');
const path = require('path');

// Create absolute path for uploads directory
const uploadDir = path.join(__dirname, '../uploads');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed!'));
  }
});

module.exports = upload; 