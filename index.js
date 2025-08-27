const express = require("express");
const dotenv = require("dotenv");
const { connectDB } = require("./connect");
const urlRoute = require("./routes/url");
const URL = require("./models/url");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8001;

app.use(express.json());

connectDB(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

app.use("/url", urlRoute);

app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );
  if (!entry) {
    return res.status(404).json({ message: "Short URL not found" });
  }
  res.redirect(entry.redirectURL);
});

app.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});
