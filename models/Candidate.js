const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    street1: { type: String, required: true, trim: true },
    street2: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const embeddedDocumentSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true, trim: true },
    fileType: { type: String, enum: ['image', 'pdf'], required: true },
    fileUrl: { type: String, required: true },
  },
  { _id: false }
);

const candidateSchema = new mongoose.Schema(
  {
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    dob: { type: Date, required: true },
    residentialAddress: { type: addressSchema, required: true },
    permanentAddress: { type: addressSchema, required: true },
    isSameAddress: { type: Boolean, required: true },
    documents: {
      type: [embeddedDocumentSchema],
      validate: {
        validator(docs) {
          return Array.isArray(docs) && docs.length >= 2;
        },
        message: 'At least 2 documents are required',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Candidate', candidateSchema);
