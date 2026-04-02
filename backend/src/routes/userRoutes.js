const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema, updateUserSchema } = require('../validators/userValidator');
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);

// Protected routes
router.use(authMiddleware);

router.get('/me', userController.getMe);

// Admin only routes
router.get('/', authorizeRoles('Admin'), userController.getAllUsers);
router.put('/:id', authorizeRoles('Admin'), validate(updateUserSchema), userController.updateUser);
router.delete('/:id', authorizeRoles('Admin'), userController.deleteUser);

module.exports = router;
