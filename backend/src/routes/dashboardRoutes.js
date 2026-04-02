const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// Only Analysts and Admins can access Dashboard summaries
router.get('/summary', authorizeRoles('Analyst', 'Admin'), dashboardController.getSummary);

module.exports = router;
