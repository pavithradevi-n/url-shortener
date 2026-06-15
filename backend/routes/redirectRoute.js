const express = require('express');
const router = express.Router();
const Url = require('../models/Url');
const Analytics = require('../models/Analytics');

// @GET /:shortCode - Redirect to original URL
router.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find URL by short code
    const url = await Url.findOne({ shortCode, isActive: true });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Check if URL is expired
    if (url.expiryDate && new Date() > new Date(url.expiryDate)) {
      return res.status(410).json({ message: 'URL has expired' });
    }

    // Get device and browser info
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    // Detect device
    let device = 'Desktop';
    if (/mobile/i.test(userAgent)) device = 'Mobile';
    else if (/tablet/i.test(userAgent)) device = 'Tablet';

    // Detect browser
    let browser = 'unknown';
    if (/chrome/i.test(userAgent)) browser = 'Chrome';
    else if (/firefox/i.test(userAgent)) browser = 'Firefox';
    else if (/safari/i.test(userAgent)) browser = 'Safari';
    else if (/edge/i.test(userAgent)) browser = 'Edge';

    // Record analytics
    await Analytics.create({
      urlId: url._id,
      ipAddress,
      userAgent,
      device,
      browser,
      timestamp: new Date()
    });

    // Increment click count
    url.clicks += 1;
    await url.save();

    // Redirect to original URL
    return res.redirect(url.originalUrl);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;