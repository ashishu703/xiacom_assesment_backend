const AppError = require('../utils/AppError');
const { MIME_BY_TYPE } = require('../constants/candidateDocuments');
const getAge = require('../utils/getAge');
const { EMAIL_REGEX, isNonEmptyString } = require('../utils/textValidation');

const TRUE_SET = new Set(['true', '1', true, 1]);
const FALSE_SET = new Set(['false', '0', false, 0]);

function parseBooleanFlag(value) {
  if (typeof value === 'string') {
    const key = value.trim().toLowerCase();
    if (TRUE_SET.has(key)) return true;
    if (FALSE_SET.has(key)) return false;
    return null;
  }
  if (TRUE_SET.has(value)) return true;
  if (FALSE_SET.has(value)) return false;
  return null;
}

function normalizeIntakeBody(body) {
  const trimStr = (v) => {
    if (v == null) return '';
    if (typeof v === 'string') return v.trim();
    return String(v).trim();
  };

  const rawDoc = body.documentEntries;
  const documentEntriesRaw =
    typeof rawDoc === 'string' ? rawDoc : rawDoc == null ? '' : String(rawDoc);

  return {
    firstName: trimStr(body.firstName),
    lastName: trimStr(body.lastName),
    email: trimStr(body.email).toLowerCase(),
    dob: trimStr(body.dob),
    residentialStreet1: trimStr(body.residentialStreet1),
    residentialStreet2: trimStr(body.residentialStreet2),
    permanentStreet1: trimStr(body.permanentStreet1),
    permanentStreet2: trimStr(body.permanentStreet2),
    isSameAddress: body.isSameAddress,
    documentEntries: documentEntriesRaw,
  };
}

function tryParseJsonString(maybeJson) {
  try {
    return JSON.parse(maybeJson);
  } catch {
    return null;
  }
}

function parseDocumentEntries(raw) {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new AppError('Document entries are missing', 400);
  }

  const parsed = tryParseJsonString(raw.trim());
  if (parsed === null) {
    throw new AppError('Document entries must be valid JSON', 400);
  }

  if (!Array.isArray(parsed)) throw new AppError('Document entries must be sent as an array', 400);
  return parsed;
}

function mimeMatchesDeclaredType(fileType, mime) {
  const allowed = MIME_BY_TYPE[fileType];
  if (!allowed) return false;
  return allowed.has(mime);
}

function validateDocuments(documentEntries, files) {
  if (!Array.isArray(files)) throw new AppError('Document files are missing', 400);
  if (documentEntries.length < 2) throw new AppError('Minimum 2 documents are required', 400);
  if (files.length !== documentEntries.length) {
    throw new AppError('Each document row needs exactly one uploaded file', 400);
  }

  for (let i = 0; i < documentEntries.length; i++) {
    const entry = documentEntries[i];
    const file = files[i];
    const rowNum = i + 1;

    if (!entry || typeof entry !== 'object') {
      throw new AppError(`Document ${rowNum}: row data is invalid`, 400);
    }
    if (!isNonEmptyString(entry.fileName)) {
      throw new AppError(`Document ${rowNum}: file name is required`, 400);
    }
    if (entry.fileType !== 'image' && entry.fileType !== 'pdf') {
      throw new AppError(`Document ${rowNum}: type must be image or pdf`, 400);
    }

    const mime = (file.mimetype || '').toLowerCase();
    if (!mimeMatchesDeclaredType(entry.fileType, mime)) {
      throw new AppError(
        `Document ${rowNum}: expected ${entry.fileType}, but received ${mime || 'unknown'}`,
        400
      );
    }
  }
}

function validatePersonalFields(normalized) {
  if (!isNonEmptyString(normalized.firstName)) throw new AppError('First name is required', 400);
  if (!isNonEmptyString(normalized.lastName)) throw new AppError('Last name is required', 400);
  if (!isNonEmptyString(normalized.email)) throw new AppError('Email is required', 400);
  if (!EMAIL_REGEX.test(normalized.email)) throw new AppError('Enter a valid email address', 400);
  if (!isNonEmptyString(normalized.dob)) throw new AppError('Date of birth is required', 400);

  const age = getAge(normalized.dob);
  if (age === null) throw new AppError('Invalid date of birth', 400);
  if (age < 18) throw new AppError('You must be at least 18 years old', 400);
}

function validateResidentialAddress(normalized) {
  if (!isNonEmptyString(normalized.residentialStreet1)) {
    throw new AppError('Residential street 1 is required', 400);
  }
  if (!isNonEmptyString(normalized.residentialStreet2)) {
    throw new AppError('Residential street 2 is required', 400);
  }
}

function validatePermanentAddressIfRequired(normalized, sameAsResidential) {
  if (sameAsResidential) return;
  if (!isNonEmptyString(normalized.permanentStreet1)) {
    throw new AppError('Permanent street 1 is required', 400);
  }
  if (!isNonEmptyString(normalized.permanentStreet2)) {
    throw new AppError('Permanent street 2 is required', 400);
  }
}

function buildAddressesFromNormalized(normalized, sameAsResidential) {
  const residentialAddress = {
    street1: normalized.residentialStreet1,
    street2: normalized.residentialStreet2,
  };

  if (sameAsResidential) {
    return { residentialAddress, permanentAddress: { ...residentialAddress } };
  }

  return {
    residentialAddress,
    permanentAddress: {
      street1: normalized.permanentStreet1,
      street2: normalized.permanentStreet2,
    },
  };
}

function validateCandidateSubmission(body, files) {
  const normalized = normalizeIntakeBody(body);

  validatePersonalFields(normalized);

  const sameAsResidential = parseBooleanFlag(normalized.isSameAddress);
  if (sameAsResidential === null) throw new AppError('Same as residential flag is invalid', 400);

  validateResidentialAddress(normalized);
  validatePermanentAddressIfRequired(normalized, sameAsResidential);

  const documentEntries = parseDocumentEntries(normalized.documentEntries);
  validateDocuments(documentEntries, files);

  const { residentialAddress, permanentAddress } = buildAddressesFromNormalized(
    normalized,
    sameAsResidential
  );

  return {
    firstName: normalized.firstName,
    lastName: normalized.lastName,
    email: normalized.email,
    dob: normalized.dob,
    sameAsResidential,
    documentEntries,
    residentialAddress,
    permanentAddress,
  };
}

module.exports = {
  validateCandidateSubmission,
};
