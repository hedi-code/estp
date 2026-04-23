const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/auth');

// Get all books
router.get('/', authMiddleware, bookController.getAllBooks);

// Get book by ID
router.get('/:id', authMiddleware, bookController.getBookById);

// Get book by user ID (if user_id column exists)
router.get('/user/:id', authMiddleware, bookController.getBookByUserId);

router.get('/entreprise/:id', authMiddleware, bookController.getBookByEntrepriseId);

// Create new book
router.post('/', authMiddleware, bookController.createBook);

// Update book
router.put('/:id', authMiddleware, bookController.updateBook);

// Delete book
router.delete('/:id', authMiddleware, bookController.deleteBook);

module.exports = router;
