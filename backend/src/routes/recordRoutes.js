const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const validate = require('../middlewares/validate');
const { createRecordSchema, updateRecordSchema, queryRecordSchema } = require('../validators/recordValidator');
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// Get records (Viewer, Analyst, Admin)
router.get('/', recordController.getRecords);
router.get('/:id', recordController.getRecordById);

// Create record (Admin only as per Assignment: Viewer/Analyst cannot create/modify)
router.post('/', authorizeRoles('Admin'), validate(createRecordSchema), recordController.createRecord);

// Update record (Admin only)
router.put('/:id', authorizeRoles('Admin'), validate(updateRecordSchema), recordController.updateRecord);

// Delete record (Admin only)
router.delete('/:id', authorizeRoles('Admin'), recordController.deleteRecord);

module.exports = router;
