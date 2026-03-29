const asyncHandler = require('../middlewares/asyncHandler');
const candidateService = require('../services/candidateService');

// Persists one intake application tied to whoever is logged in (submittedBy on the record).
const submitCandidate = asyncHandler(async (req, res) => {
  const candidateRecord = await candidateService.submitApplication(req.body, req.files, req.userId);

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    candidate: candidateRecord,
  });
});

module.exports = {
  submitCandidate,
};
