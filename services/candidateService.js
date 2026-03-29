const path = require('path');
const { validateCandidateSubmission } = require('../validators/candidateValidator');
const candidateRepository = require('../repositories/candidateRepository');

function mapFilesToDocuments(documentEntries, files) {
  return documentEntries.map((entry, index) => {
    const storedFile = files[index];
    const publicPath = `/uploads/candidates/${path.basename(storedFile.path)}`;
    return {
      fileName: entry.fileName.trim(),
      fileType: entry.fileType,
      fileUrl: publicPath,
    };
  });
}

async function submitApplication(body, files, submittedByUserId) {
  const intakePacket = validateCandidateSubmission(body, files);
  const documentRows = mapFilesToDocuments(intakePacket.documentEntries, files);

  const newApplication = {
    submittedBy: submittedByUserId,
    firstName: intakePacket.firstName,
    lastName: intakePacket.lastName,
    email: intakePacket.email,
    dob: new Date(intakePacket.dob),
    residentialAddress: intakePacket.residentialAddress,
    permanentAddress: intakePacket.permanentAddress,
    isSameAddress: intakePacket.sameAsResidential,
    documents: documentRows,
  };

  const candidateRecord = await candidateRepository.insertCandidate(newApplication);
  return candidateRecord;
}

module.exports = {
  submitApplication,
};
