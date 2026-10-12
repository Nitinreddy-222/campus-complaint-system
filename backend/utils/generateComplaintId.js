const Complaint = require('../models/Complaint');

/**
 * Generates a unique complaint ID in format CMP-YYYY-XXXX (e.g. CMP-2026-0001)
 */
const generateComplaintId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `CMP-${currentYear}-`;

  // Find the highest number complaint ID for the current year
  const latestComplaint = await Complaint.findOne({
    complaintId: { $regex: `^${prefix}` }
  })
    .sort({ createdAt: -1 })
    .select('complaintId');

  let nextSequence = 1;

  if (latestComplaint && latestComplaint.complaintId) {
    const parts = latestComplaint.complaintId.split('-');
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }
  }

  // Format with leading zeros to 4 digits (e.g. 0001, 0025, 0100)
  const formattedSeq = String(nextSequence).padStart(4, '0');
  const generatedId = `${prefix}${formattedSeq}`;

  // Check collision just in case and increment if duplicate
  const existing = await Complaint.findOne({ complaintId: generatedId });
  if (existing) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${randomSuffix}`;
  }

  return generatedId;
};

module.exports = generateComplaintId;
