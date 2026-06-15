const Url = require('../models/Url');
const Analytics = require('../models/Analytics');
const { nanoid } = require('nanoid');

// @route POST /api/urls/shorten
const createShortUrl = async (req, res) => {
  try {
    const { originalUrl, customAlias, expiryDate } = req.body;

    // Validate URL
    try {
      new URL(originalUrl);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid URL' });
    }

    // Check custom alias if provided
    if (customAlias) {
      const aliasExists = await Url.findOne({ shortCode: customAlias });
      if (aliasExists) {
        return res.status(400).json({ message: 'Custom alias already taken' });
      }
    }

    // Generate short code
    const shortCode = customAlias || nanoid(6);

    // Create URL
    const url = await Url.create({
      originalUrl,
      shortCode,
      customAlias: customAlias || null,
      user: req.user._id,
      expiryDate: expiryDate || null
    });

    res.status(201).json({
      _id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      clicks: url.clicks,
      createdAt: url.createdAt,
      expiryDate: url.expiryDate
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route GET /api/urls
const getAllUrls = async (req, res) => {
  try {
    const urls = await Url.find({ user: req.user._id }).sort({ createdAt: -1 });

    const urlsWithShortUrl = urls.map(url => ({
      _id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      clicks: url.clicks,
      createdAt: url.createdAt,
      expiryDate: url.expiryDate,
      isActive: url.isActive
    }));

    res.status(200).json(urlsWithShortUrl);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route GET /api/urls/:id/analytics
const getAnalytics = async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    const visits = await Analytics.find({ urlId: url._id })
      .sort({ timestamp: -1 })
      .limit(20);

    res.status(200).json({
      _id: url._id,
      originalUrl: url.originalUrl,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      shortCode: url.shortCode,
      totalClicks: url.clicks,
      createdAt: url.createdAt,
      lastVisited: visits.length > 0 ? visits[0].timestamp : null,
      recentVisits: visits
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route DELETE /api/urls/:id
const deleteUrl = async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    await Url.findByIdAndDelete(req.params.id);
    await Analytics.deleteMany({ urlId: req.params.id });

    res.status(200).json({ message: 'URL deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route PUT /api/urls/:id
const updateUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;

    // Validate URL
    try {
      new URL(originalUrl);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid URL' });
    }

    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    url.originalUrl = originalUrl;
    await url.save();

    res.status(200).json({
      _id: url._id,
      originalUrl: url.originalUrl,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      clicks: url.clicks,
      createdAt: url.createdAt
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createShortUrl, getAllUrls, getAnalytics, deleteUrl, updateUrl };