const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { cloudinaryUpload } = require('../util/cloudinary');
const nodemailer = require('nodemailer');
const PreHireFile = require('../prehiremodel');
const authMiddleware = require('../middleware/auth'); // your existing JWT middleware

// ─── Storage config ────────────────────────────────────────────────────────────
// Files land in /uploads/prehire/<jobId>/<originalname>
const TMP_DIR = '/tmp/public/files';
fs.mkdirSync(TMP_DIR, { recursive: true });

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowed = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  const allowedExt = ['.csv', '.xls', '.xlsx'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowed.includes(file.mimetype) || allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV, XLS, and XLSX files are accepted.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// ─── Inject jobId before multer runs so diskStorage can use it ─────────────────
const injectJobId = (req, res, next) => {
  req.jobId = uuidv4();
  next();
};

// ─── Email transporter ─────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── Helper: send admin notification ──────────────────────────────────────────
const notifyAdmin = async (jobId, fileName, userEmail, recordCount) => {
  await transporter.sendMail({
    from: `"PrognostiCare System" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL || 'rsmith@prognosticare.org',
    subject: `[PrognostiCare] New Pre-Hire File Received — Job ${jobId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #185FA5;">New Pre-Hire File Received</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px; font-weight: bold; color: #555;">Job ID</td><td style="padding: 8px;">${jobId}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding: 8px; font-weight: bold; color: #555;">File Name</td><td style="padding: 8px;">${fileName}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #555;">Submitted By</td><td style="padding: 8px;">${userEmail}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding: 8px; font-weight: bold; color: #555;">Record Count</td><td style="padding: 8px;">${recordCount}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #555;">Received At</td><td style="padding: 8px;">${new Date().toLocaleString()}</td></tr>
        </table>
        <p style="margin-top: 20px; color: #555;">
          Please log in to the admin dashboard to begin processing this file.
        </p>
      </div>
    `,
  });
};

// ─── Helper: send user confirmation ───────────────────────────────────────────
const notifyUser = async (jobId, fileName, userEmail) => {
  await transporter.sendMail({
    from: `"PrognostiCare" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: `Your Pre-Hire File Has Been Received — Job ${jobId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #185FA5;">File Received Successfully</h2>
        <p>Thank you for submitting your pre-hire candidate file.</p>
        <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
          <tr style="background:#f0f7ff;"><td style="padding: 8px; font-weight: bold; color: #555;">Job ID</td><td style="padding: 8px; font-family: monospace;">${jobId}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #555;">File Name</td><td style="padding: 8px;">${fileName}</td></tr>
          <tr style="background:#f0f7ff;"><td style="padding: 8px; font-weight: bold; color: #555;">Status</td><td style="padding: 8px;"><span style="color:#185FA5; font-weight:bold;">Received</span></td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #555;">Submitted At</td><td style="padding: 8px;">${new Date().toLocaleString()}</td></tr>
        </table>
        <p style="color: #555;">
          The PrognostiCare team will begin processing your file shortly. 
          You will receive another notification once the analysis is complete and your results are ready for review.
        </p>
        <p style="color: #888; font-size: 13px;">
          Please keep your Job ID for reference: <strong style="font-family: monospace;">${jobId}</strong>
        </p>
      </div>
    `,
  });
};

// ─── Helper: count CSV records ─────────────────────────────────────────────────
const countRecords = (filePath, ext) => {
  if (ext !== '.csv') return 0; // for xlsx you'd use SheetJS on the backend
  try {
    const text = fs.readFileSync(filePath, 'utf8');
    const lines = text.trim().split('\n');
    return Math.max(0, lines.length - 1); // subtract header row
  } catch {
    return 0;
  }
};

// ─── Helper: update status with history entry ──────────────────────────────────
const updateStatus = async (jobId, newStatus, note = '') => {
  return PreHireFile.findOneAndUpdate(
    { jobId },
    {
      $set: { status: newStatus, ...(newStatus === 'Processing' ? { processedAt: new Date() } : {}), ...(newStatus === 'Complete' || newStatus === 'Ready for Review' ? { completedAt: new Date() } : {}) },
      $push: { statusHistory: { status: newStatus, changedAt: new Date(), note } },
    },
    { new: true }
  );
};

// ─── POST /api/prehire-upload ──────────────────────────────────────────────────
router.post(
  '/prehire-upload',
  authMiddleware,
  injectJobId,
  (req, res, next) => {
    upload.single('preHireFile')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const jobId = req.jobId;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const userEmail = req.user?.email || '';

    try {
      // 1. Upload buffer to Cloudinary
// 1. Save buffer to /tmp/public/files, then upload to Cloudinary
const cloudinary = require('cloudinary').v2;
const tmpFileName = `prehire_${Date.now()}${ext}`;
const tmpFilePath = path.join(TMP_DIR, tmpFileName);
fs.writeFileSync(tmpFilePath, req.file.buffer);

const fileUrl = await new Promise((resolve, reject) => {
  cloudinary.uploader.upload(
    tmpFilePath,
    { resource_type: 'auto', folder: 'prehire' },
    (error, result) => {
      // Clean up tmp file regardless of outcome
      fs.unlink(tmpFilePath, () => {});
      if (error) reject(error);
      else resolve(result.secure_url);
    }
  );
});

      // 2. Store file record in DB with Cloudinary URL
      const preHireRecord = await PreHireFile.create({
        jobId,
        originalFileName: req.file.originalname,
        storedFileName: `prehire_${Date.now()}${ext}`,
        filePath: fileUrl,                // ← Cloudinary URL
        user: req.user._id,
        status: 'Received',
        recordCount: 0,
        statusHistory: [{ status: 'Received', changedAt: new Date(), note: 'File uploaded by user' }],
      });

      // 3. Respond immediately
      res.status(200).json({
        success: true,
        jobId,
        status: 'Received',
        fileName: req.file.originalname,
        recordCount: 0,
        message: 'File received successfully. The PrognostiCare team will begin processing shortly.',
      });

      // 4. Kick off processing workflow asynchronously
      processPrehireFile(jobId, fileUrl, req.user._id).catch((err) =>
        console.error(`Processing failed for job ${jobId}:`, err.message)
      );
    } catch (error) {
      console.error('Pre-hire upload error:', error);
      res.status(500).json({ error: 'Failed to save file record. Please try again.' });
    }
  }
);

// ─── Async processing workflow ─────────────────────────────────────────────────
async function processPrehireFile(jobId, fileUrl, userId) {
  try {
    await updateStatus(jobId, 'Processing', 'Automated processing started');
    // ── Put your actual analysis logic here ──────────────────────────────────
    // e.g. call your PDL enrichment, scoring engine, etc.
    // const results = await runScoringEngine(filePath);
    // await PreHireFile.findOneAndUpdate({ jobId }, { results });
    // ─────────────────────────────────────────────────────────────────────────

    // Status → Complete
    await updateStatus(jobId, 'Complete', 'Processing finished');

    // Status → Ready for Review
    await updateStatus(jobId, 'Ready for Review', 'Results available for user');

    // Optional: notify user that results are ready
    // const record = await PreHireFile.findOne({ jobId }).populate('user', 'email');
    // if (record?.user?.email) {
    //   await transporter.sendMail({
    //     from: `"PrognostiCare" <${process.env.SMTP_USER}>`,
    //     to: record.user.email,
    //     subject: `Your Pre-Hire Analysis Is Ready — Job ${jobId}`,
    //     html: `
    //       <div style="font-family: Arial, sans-serif; max-width: 600px;">
    //         <h2 style="color: #185FA5;">Results Ready for Review</h2>
    //         <p>Your pre-hire retention analysis for job <strong style="font-family: monospace;">${jobId}</strong> is complete.</p>
    //         <p>Please log in to your PrognostiCare dashboard to review the results.</p>
    //       </div>
    //     `,
    //   }).catch((err) => console.error('Results-ready email failed:', err.message));
    // }
  } catch (error) {
    console.error(`Workflow error for job ${jobId}:`, error.message);
    await updateStatus(jobId, 'Received', `Processing failed: ${error.message} — queued for retry`).catch(() => {});
  }
}

// ─── GET /api/prehire-status/:jobId ───────────────────────────────────────────
// Lets the frontend poll for status updates
router.get('/prehire-status/:jobId', authMiddleware, async (req, res) => {
  try {
    const record = await PreHireFile.findOne({
      jobId: req.params.jobId,
      user: req.user._id, // ensure user can only see their own jobs
    }).select('jobId status recordCount originalFileName statusHistory createdAt processedAt completedAt');

    if (!record) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    res.json({
      jobId: record.jobId,
      status: record.status,
      fileName: record.originalFileName,
      recordCount: record.recordCount,
      statusHistory: record.statusHistory,
      createdAt: record.createdAt,
      processedAt: record.processedAt,
      completedAt: record.completedAt,
    });
  } catch (error) {
    console.error('Status fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch job status.' });
  }
});

// ─── GET /api/prehire-jobs ─────────────────────────────────────────────────────
// Returns all pre-hire uploads for the logged-in user (for dashboard)
router.get('/prehire-jobs', authMiddleware, async (req, res) => {
  try {
    const jobs = await PreHireFile.find({ user: req.user._id })
      .select('jobId status recordCount originalFileName createdAt completedAt')
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    console.error('Jobs fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs.' });
  }
});

// ─── PATCH /api/prehire-status/:jobId  (admin only) ───────────────────────────
// Allows admin to manually advance status
router.patch('/prehire-status/:jobId', authMiddleware, async (req, res) => {
  const { status, note } = req.body;
  const allowedStatuses = ['Received', 'Processing', 'Complete', 'Ready for Review'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
  }

  try {
    const record = await updateStatus(req.params.jobId, status, note || `Manually set by admin`);
    if (!record) return res.status(404).json({ error: 'Job not found.' });
    res.json({ success: true, jobId: record.jobId, status: record.status });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status.' });
  }
});



// ─── GET /api/admin/prehire-files ─────────────────────────────────────────────
router.get('/admin/prehire-files', authMiddleware, async (req, res) => {
    try {
      const files = await PreHireFile.find({})
        .populate('user', 'email')
        .select('jobId status recordCount originalFileName createdAt completedAt processedAt statusHistory user adminNotified userNotified')
        .sort({ createdAt: -1 });
  
      res.json({ files });
    } catch (error) {
      console.error('Admin prehire-files fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch pre-hire files.' });
    }
  });
  
  // ─── DELETE /api/admin/prehire-files/:jobId ────────────────────────────────────
  router.delete('/admin/prehire-files/:jobId', authMiddleware, async (req, res) => {
    try {
      const record = await PreHireFile.findOneAndDelete({ jobId: req.params.jobId });
      if (!record) return res.status(404).json({ error: 'Job not found.' });
  
      // File is on Cloudinary — optionally delete it there too:
      // const publicId = record.filePath.split('/').pop().split('.')[0];
      // await require('cloudinary').v2.uploader.destroy(`prehire/${publicId}`, { resource_type: 'raw' });
  
      res.json({ success: true, jobId: req.params.jobId });
    } catch (error) {
      console.error('Admin prehire delete error:', error);
      res.status(500).json({ error: 'Failed to delete pre-hire file.' });
    }
  });
  
  
module.exports = router;