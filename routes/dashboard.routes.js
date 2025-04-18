const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboard.controller');

router.get('/', dashboardController.getDashboardData);
router.get('/admin', dashboardController.getAdminDashboardData); // Admin dashboard
//  authMiddleware,
module.exports = router;