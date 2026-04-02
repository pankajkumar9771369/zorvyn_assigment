const dashboardService = require('../services/dashboardService');

/**
 * Controller strictly handling HTTP logic, deferring business logic to DashboardService.
 */
const getSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.gte = new Date(startDate);
      if (endDate) dateFilter.date.lte = new Date(endDate);
    }

    // Call isolated Service logic
    const summaryData = await dashboardService.generateSummary(dateFilter);

    res.status(200).json({
      success: true,
      data: summaryData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary
};
