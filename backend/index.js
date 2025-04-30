import express from "express";
import cors from "cors";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import dotenv from "dotenv";
import axios from "axios";

// Load environment variables
dotenv.config();
puppeteer.use(StealthPlugin());

const app = express();
app.use(cors());
app.use(express.json());

const LOGIN_URL = "https://www.linkedin.com/login";
const FEED_URL = "https://www.linkedin.com/feed/";
const USERNAME = process.env.LINKEDIN_EMAIL;
const PASSWORD = process.env.LINKEDIN_PASSWORD;

/**
 * Logs into LinkedIn using Puppeteer and stealth plugin
 * @param {import('puppeteer').Page} page
 * @returns {Promise<boolean>} true if login succeeded
 */
async function loginToLinkedIn(page) {
  console.log("🔵 Navigating to LinkedIn login page...");
  await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  console.log("🔵 Typing credentials...");
  await page.type("input#username", USERNAME, { delay: 100 });
  await page.type("input#password", PASSWORD, { delay: 100 });
  await page.click("button[type='submit']");

  console.log("🔵 Logging in...");
  try {
    await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 15000 });
    const currentURL = page.url();
    console.log(`Current URL after login: ${currentURL}`);
    if (currentURL === FEED_URL) {
      console.log("✅ Successfully logged into LinkedIn!");
      return true;
    }
    console.error("❌ Login failed: did not reach feed URL.");
    return false;
  } catch (err) {
    console.error("❌ Login failed or took too long!", err);
    return false;
  }
}

/**
  * Checks a URL via HTTP HEAD request using axios
  * @param {string} url
  * @returns {Promise<boolean>} true if resource not found (404)
*/
async function checkWithHead(url) {
  try {
    const res = await axios.head(url, { validateStatus: () => true });
    return res.status === 404;
  } catch (err) {
    console.error(`Error checking HEAD for ${url}:`, err);
    return false;
  }
}

/**
 * Puppeteer-based LinkedIn profile existence check
 * @param {import('puppeteer').Page} page
 * @param {string} username
 * @returns {Promise<boolean>} true if profile not found (404)
 */
async function checkLinkedInProfile(page, username) {
  const profileUrl = `https://www.linkedin.com/in/${username}/`;
  try {
    await page.goto(profileUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
    // LinkedIn redirects missing profiles to /404/
    return page.url().includes("/404/");
  } catch (err) {
    console.error(`Error loading LinkedIn profile ${username}:`, err);
    return false;
  }
}

app.post("/checkUsername", async (req, res) => {
  const { username } = req.body;
  const availability = { linkedin: false, github: false, leetcode: false };

  console.log("🚀 Launching browser for LinkedIn...");
  let browser;
  let page;
  try {
    browser = await puppeteer.launch({
      executablePath: process.env.CHROME_PATH || undefined,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--single-process'],
      headless: 'new',
      ignoreHTTPSErrors: true,
    });
    page = await browser.newPage();

    // Perform LinkedIn login
    const loggedIn = await loginToLinkedIn(page);
    if (loggedIn) {
      availability.linkedin = await checkLinkedInProfile(page, username);
    } else {
      console.warn("⚠️ Skipping LinkedIn profile check due to login failure.");
    }
  } catch (err) {
    console.error("Browser or login error:", err);
  } finally {
    if (browser) await browser.close();
  }

  // Check GitHub via HEAD request
  const githubUrl = `https://www.github.com/${username}`;
  availability.github = await checkWithHead(githubUrl);

  // Check LeetCode via HEAD request
  const leetcodeUrl = `https://www.leetcode.com/u/${username}`;
  availability.leetcode = await checkWithHead(leetcodeUrl);

  console.log("✅ Availability results:", availability);
  res.json(availability);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
