import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables (e.g. PORT)
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Checks a URL via HTTP HEAD request using axios
 * @param {string} url
 * @returns {Promise<boolean>} true if resource not found (404, 400, 403, 410)
 */
async function checkWithHead(url) {
  try {
    const res = await axios.head(url, { validateStatus: () => true });
    console.log(`HEAD request to ${url} returned status: ${res.status}`);
    return res.status === 400 || res.status === 404 || res.status === 410;
  } catch (err) {
    console.error(`Error checking HEAD for ${url}:`, err);
    return false;
  }
}

app.post("/checkUsername", async (req, res) => {
  const { username } = req.body;
  const availability = {
    github: false,
    leetcode: false,
    hackerrank: false,
    twitter: false,
    devto: false,
    npm: false,
    dockerhub: false,
    kaggle: false,
    codeforces: false
  };

  // Define URL patterns for each platform
  const urls = {
    github: `https://www.github.com/${username}`,
    leetcode: `https://www.leetcode.com/u/${username}`,
    hackerrank: `https://www.hackerrank.com/profile/${username}`,
    twitter: `https://twitter.com/${username}`,
    devto: `https://dev.to/${username}`,
    npm: `https://www.npmjs.com/~${username}`,
    dockerhub: `https://hub.docker.com/u/${username}`,
    kaggle: `https://www.kaggle.com/${username}`,
    codeforces: `https://codeforces.com/profile/${username}`
  };

  // Check each platform sequentially (could be parallelized with Promise.all)
  for (const [platform, url] of Object.entries(urls)) {
    // eslint-disable-next-line no-await-in-loop
    availability[platform] = await checkWithHead(url);
  }

  console.log("✅ Availability results:", availability);
  res.json(availability);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
