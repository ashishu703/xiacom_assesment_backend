const express = require('express');
const candidateController = require('../controllers/candidateController');
const authenticate = require('../middlewares/authenticate');
const { handleCandidateDocumentUpload } = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post(
  '/submit',
  authenticate,
  handleCandidateDocumentUpload,
  candidateController.submitCandidate
);

module.exports = router;
