const Candidate = require('../models/Candidate');

async function insertCandidate(candidatePayload) {
  return Candidate.create(candidatePayload);
}

module.exports = {
  insertCandidate,
};
