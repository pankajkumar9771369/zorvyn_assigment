const prisma = require('../prisma');

const createRecord = async (req, res, next) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    const record = await prisma.record.create({
      data: {
        amount,
        type,
        category,
        date: date ? new Date(date) : undefined,
        notes,
        userId: req.user.id
      }
    });

    res.status(201).json({ success: true, message: 'Record created', data: record });
  } catch (error) {
    next(error);
  }
};

const getRecords = async (req, res, next) => {
  try {
    const { q, type, category, startDate, endDate, page, limit } = req.query;

    const whereClause = { isDeleted: false };


    if (q) {
      whereClause.OR = [
        { notes: { contains: q } },
        { category: { contains: q } }
      ];
    }

    if (type) whereClause.type = type;
    if (category) whereClause.category = category;

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    const [records, totalCount] = await Promise.all([
      prisma.record.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { date: 'desc' },
        include: { user: { select: { name: true, email: true } } }
      }),
      prisma.record.count({ where: whereClause })
    ]);

    res.status(200).json({
      success: true,
      data: records,
      meta: {
        totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.max(1, Math.ceil(totalCount / limitNum))
      }
    });
  } catch (error) {
    next(error);
  }
};

const getRecordById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await prisma.record.findFirst({
      where: { id: Number(id), isDeleted: false },
      include: { user: { select: { name: true, email: true } } }
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

const updateRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, type, category, date, notes } = req.body;

    const existingRecord = await prisma.record.findFirst({ where: { id: Number(id), isDeleted: false } });
    if (!existingRecord) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }


    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only Admins can update records' });
    }

    const record = await prisma.record.update({
      where: { id: Number(id) },
      data: {
        amount,
        type,
        category,
        date: date ? new Date(date) : undefined,
        notes
      }
    });

    res.status(200).json({ success: true, message: 'Record updated', data: record });
  } catch (error) {
    next(error);
  }
};

const deleteRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingRecord = await prisma.record.findFirst({ where: { id: Number(id), isDeleted: false } });
    if (!existingRecord) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }


    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only Admins can delete' });
    }

    await prisma.record.update({ where: { id: Number(id) }, data: { isDeleted: true } });

    res.status(200).json({ success: true, message: 'Record deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord
};
