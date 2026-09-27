const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Store files in disk instead of memory
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

// File filter to accept strictly .xlsx or .xls
const excelFilter = (req, file, cb) => {
  if (
    file.mimetype.includes("excel") ||
    file.mimetype.includes("spreadsheetml") ||
    file.mimetype.includes("csv") ||
    file.originalname.match(/\.(xlsx|xls|csv)$/)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Please upload only valid Excel or CSV files (.xlsx, .xls, .csv)."), false);
  }
};

const upload = multer({
  storage,
  fileFilter: excelFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * Parses an Excel file and extracts rows into normalized objects
 * @param {string} filePath - Path to the Excel file
 * @returns {Array} - Array of participant objects
 */
const parseExcelFile = (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath, { type: 'file' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Convert to JSON, using first row as headers
    const rawData = xlsx.utils.sheet_to_json(sheet);
    
    // Normalize properties
    const parsedParticipants = rawData.map(row => {
      // Look for standard "attended" keys (handle case variations)
      let attendedVal = row.attended ?? row.Attended ?? row.ATTENDED;
      // Convert 'yes', 'true', 1 to strict boolean
      let isAttended = false;
      if (typeof attendedVal === 'string') {
        isAttended = ['yes', 'true', 'y', '1'].includes(attendedVal.toLowerCase().trim());
      } else if (typeof attendedVal === 'boolean') {
        isAttended = attendedVal;
      } else if (typeof attendedVal === 'number') {
        isAttended = attendedVal > 0;
      }

      return {
        name: row.name || row.Name || row.NAME || "Unknown Participant",
        email: row.email || row.Email || row.EMAIL || "no-email@provided.com",
        attended: isAttended,
        role: row.role || row.Role || row.ROLE || 'Participant' 
      };
    }).filter(p => p.name !== "Unknown Participant" || p.email !== "no-email@provided.com"); // Strip fully empty rows
    
    return parsedParticipants;
  } catch (error) {
    throw new Error('Failed to parse Excel file. Check file integrity.');
  }
};

module.exports = {
  upload,
  parseExcelFile
};
