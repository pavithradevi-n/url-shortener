const express = require('express');
const router = express.Router();
const { createShortUrl, getAllUrls, getAnalytics, deleteUrl, updateUrl } = require('../controllers/urlController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.post('/shorten', protect, createShortUrl);
router.get('/', protect, getAllUrls);
router.get('/:id/analytics', protect, getAnalytics);
router.delete('/:id', protect, deleteUrl);
router.put('/:id', protect, updateUrl);

module.exports = router;