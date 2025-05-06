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
 * Checks a profile URL.
 *  – LeetCode: GET with browser‑UA, detect redirect to /404/ or “Page Not Found” in HTML
 *  – Others: HEAD and check for 4xx/403 statuses
 *
 * @param {string} url
 * @returns {Promise<boolean>} true if profile NOT found (available)
 */
async function checkWithHead(url) {
  try {
    // special‑case LeetCode
    if (url.includes("leetcode.com/u/")) {
      const res = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
          Accept: "text/html",
        },
        maxRedirects: 5,
        validateStatus: () => true
      });

      const finalUrl = res.request.res.responseUrl || "";
      // either redirected to /404/ or HTML contains “Page Not Found”
      if (res.status === 404 || finalUrl.includes("/404/") || res.data.includes("Page Not Found")) {
        console.log(`LeetCode GET to ${url} → ${res.status}, missing`);
        return true;
      }
      console.log(`LeetCode GET to ${url} → ${res.status}, exists`);
      return false;
    }

    // default HEAD for other platforms
    const res = await axios.head(url, { validateStatus: () => true });
    console.log(`HEAD request to ${url} returned status: ${res.status}`);
    return [400, 403, 404, 410].includes(res.status);
  } catch (err) {
    console.error(`Error checking ${url}:`, err);
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

  const urls = {
    github:     `https://www.github.com/${username}`,
    leetcode:   `https://www.leetcode.com/u/${username}`,
    hackerrank: `https://www.hackerrank.com/profile/${username}`,
    twitter:    `https://twitter.com/${username}`,
    devto:      `https://dev.to/${username}`,
    npm:        `https://www.npmjs.com/~${username}`,
    dockerhub:  `https://hub.docker.com/u/${username}`,
    kaggle:     `https://www.kaggle.com/${username}`,
    codeforces:`https://codeforces.com/profile/${username}`
  };

  for (const [platform, url] of Object.entries(urls)) {
    // eslint-disable-next-line no-await-in-loop
    availability[platform] = await checkWithHead(url);
  }

  console.log("✅ Availability results:", availability);
  res.json(availability);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
