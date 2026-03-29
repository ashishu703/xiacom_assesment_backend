/**
 * Single source for candidate upload MIME rules (multer + validateDocuments must stay in sync).
 */
const MIME_TO_STORED_EXT = Object.freeze({
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'application/pdf': '.pdf',
});

const ALLOWED_CANDIDATE_MIME_SET = new Set(Object.keys(MIME_TO_STORED_EXT));

const MIME_BY_TYPE = Object.freeze({
  image: new Set(['image/jpeg', 'image/png']),
  pdf: new Set(['application/pdf']),
});

module.exports = {
  MIME_TO_STORED_EXT,
  ALLOWED_CANDIDATE_MIME_SET,
  MIME_BY_TYPE,
};
