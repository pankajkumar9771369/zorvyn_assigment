const prisma = require('../prisma');

/**
 * Service to aggregate dashboard metrics based on date filters and role scoping.
 * Extracted from the Controller to demonstrate Service Layer Architecture and Separation of Concerns.
 */
class DashboardService {
  /**
   * Generates a comprehensive financial summary.
   * @param {Object} dateFilter - Prisma compatible date ranges
   * @returns {Promise<Object>} Aggregated dashboard models
   */
  async generateSummary(dateFilter = {}) {
    // 1. Calculate Income & Expense Totals natively via SQL sum mapping
    const [aggIncome, aggExpense] = await Promise.all([
      prisma.record.aggregate({ where: { type: 'Income', isDeleted: false, ...dateFilter }, _sum: { amount: true } }),
      prisma.record.aggregate({ where: { type: 'Expense', isDeleted: false, ...dateFilter }, _sum: { amount: true } })
    ]);

    const totalIncome = aggIncome._sum.amount || 0;
    const totalExpense = aggExpense._sum.amount || 0;
    const netBalance = totalIncome - totalExpense;

    // 2. Fetch Category-wise totals grouping cleanly
    const categoryAgg = await prisma.record.groupBy({
      by: ['category', 'type'],
      where: { isDeleted: false, ...dateFilter },
      _sum: { amount: true }
    });

    const categoryTotals = categoryAgg.map(cat => ({
      category: cat.category,
      type: cat.type,
      total: cat._sum.amount
    }));

    // 3. Process month-over-month trend analysis mathematically in-memory
    const allRecords = await prisma.record.findMany({
      where: { isDeleted: false, ...dateFilter },
      select: { amount: true, type: true, date: true }
    });

    const monthlyTrendsMap = {};
    allRecords.forEach(record => {
      const monthStr = record.date.toISOString().slice(0, 7); // Generates YYYY-MM
      if (!monthlyTrendsMap[monthStr]) {
        monthlyTrendsMap[monthStr] = { month: monthStr, income: 0, expense: 0 };
      }
      if (record.type === 'Income') monthlyTrendsMap[monthStr].income += record.amount;
      else if (record.type === 'Expense') monthlyTrendsMap[monthStr].expense += record.amount;
    });

    const monthlyTrends = Object.values(monthlyTrendsMap).sort((a, b) => a.month.localeCompare(b.month));

    // 4. Recent live stream activities
    const recentActivity = await prisma.record.findMany({
      where: { isDeleted: false, ...dateFilter },
      orderBy: { date: 'desc' },
      take: 5,
      include: { user: { select: { name: true, email: true } } }
    });

    return {
      totalIncome,
      totalExpense,
      netBalance,
      categoryTotals,
      monthlyTrends,
      recentActivity
    };
  }
}

module.exports = new DashboardService();
