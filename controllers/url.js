const { nanoid } = require("nanoid");
const URL = require("../models/url");

async function handleGenerateNewShortURL(req, res) {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    const urlPattern = /^(https?:\/\/)[\w.-]+\.[a-z]{2,}.*$/i;
    if (!urlPattern.test(url)) {
      return res.status(400).json({ message: "Invalid URL format" });
    }

    let shortId;
    let exists = true;
    while (exists) {
      shortId = nanoid(6);
      const existing = await URL.findOne({ shortId });
      if (!existing) exists = false;
    }

    const newURL = await URL.create({
      shortId,
      redirectURL: url,
      visitHistory: [],
    });

    const baseURL = process.env.BASE_URL || "https://url-shortener-backend-75h1.onrender.com";
    return res.status(201).json({
      shortUrl: `${baseURL}/${newURL.shortId}`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error, try again later" });
  }
}

async function handleGetAnalytics(req, res) {
  const shortId = req.params.shortId;
  const result = await URL.findOne({ shortId });
  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
}

module.exports = {
  handleGenerateNewShortURL,
  handleGetAnalytics,
};
