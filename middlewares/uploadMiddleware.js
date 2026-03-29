const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const AppError = require('../utils/AppError');
const {
  MIME_TO_STORED_EXT,
  ALLOWED_CANDIDATE_MIME_SET,
} = require('../constants/candidateDocuments');

const uploadDir = path.join(__dirname, '..', 'uploads', 'candidates');

function fileFilter(_req, file, cb) {
  const mime = (file.mimetype || '').toLowerCase();
  if (!ALLOWED_CANDIDATE_MIME_SET.has(mime)) {
    return cb(new AppError('Invalid file type - use JPEG, PNG, or PDF only', 400));
  }
  cb(null, true);
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    fs.mkdir(uploadDir, { recursive: true }, (mkdirErr) => {
      if (mkdirErr) return cb(mkdirErr);
      cb(null, uploadDir);
    });
  },
  filename(req, file, cb) {
    const mime = (file.mimetype || '').toLowerCase();
    const ext = MIME_TO_STORED_EXT[mime] || path.extname(file.originalname || '').toLowerCase() || '';
    const uploaderId = req.userId || 'unknown-user';
    const nonce = crypto.randomBytes(16).toString('hex');
    const uniqueName = `${uploaderId}-${Date.now()}-${nonce}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 12 * 1024 * 1024 },
});

function handleCandidateDocumentUpload(req, res, next) {
  upload.array('documentFiles', 25)(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('One of the files exceeds the size limit', 400));
    }
    if (err instanceof multer.MulterError) {
      return next(new AppError(err.message, 400));
    }
    return next(err);
  });
}

module.exports = {
  handleCandidateDocumentUpload,
};
