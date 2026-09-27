const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { upload } = require('../utils/excelParser');


// GET global KPIs
router.get('/analytics/kpi', analyticsController.getGlobalKpis);

// GET computed analytics for an event
router.get('/analytics/event/:id', analyticsController.getEventAnalytics);

// POST Excel file buffer to parse and inject participants inline
router.post('/events/:id/upload-excel', upload.single('file'), analyticsController.uploadExcel);

module.exports = router;
