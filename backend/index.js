import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { TwitterApi } from "twitter-api-v2";
import puppeteer from "puppeteer";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
};

const PUPPETEER_OPTIONS = {
  headless: true,
  executablePath: process.env.CHROME_PATH || undefined,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
};

// 1. GitHub
async function checkGitHub(username) {
  try {
    const headers = { ...DEFAULT_HEADERS };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    const res = await axios.get(`https://api.github.com/users/${username}`, { headers });
    return res.status === 200;
  } catch (e) {
    return e.response?.status !== 200 ? false : Promise.reject(e);
  }
}

// 2. LeetCode (GraphQL + Puppeteer fallback)
async function checkLeetCode(username) {
  try {
    const query = { query: `query($u:String!){ matchedUser(username:$u){ username }} `, variables: { u: username } };
    const res = await axios.post('https://leetcode.com/graphql', query, { headers: { ...DEFAULT_HEADERS, 'Content-Type': 'application/json' } });
    return res.data.data.matchedUser !== null;
  } catch {
    return checkLeetCodePuppeteer(username);
  }
}
async function checkLeetCodePuppeteer(username) {
  const browser = await puppeteer.launch(PUPPETEER_OPTIONS);
  const page = await browser.newPage();
  await page.setUserAgent(DEFAULT_HEADERS['User-Agent']);
  const res = await page.goto(`https://leetcode.com/u/${username}`, { waitUntil: 'domcontentloaded' });
  const html = await page.content();
  await browser.close();
  // Detect 404 by status or by page content
  if (res.status() === 404 || /Page Not Found/i.test(html) || /404/.test(html)) return false;
  return true;
}

// 3. HackerRank
async function checkHackerRank(username) {
  try {
    const res = await axios.get(`https://www.hackerrank.com/${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'text/html'
      },
      maxRedirects: 0,
      validateStatus: () => true  // Allow handling all status codes manually
    });
    console.log(res.status);
    
    if (res.status === 302) {
      // Redirect means profile exists
      return true;
    }

    if (res.status === 200) {
      // Check if "Page not found" exists in HTML
      return !res.data.includes('404') && !res.data.includes('We could not find the page you were looking for, so we found something to make you laugh to make up for it.');
    }

    return false;
  } catch (e) {
    console.error('Error checking HackerRank:', e);
    return false;
  }
}

// 4. Twitter
async function checkTwitter(username) {
  if (process.env.TWITTER_BEARER_TOKEN) {
    const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
    try { await client.v2.userByUsername(username); return true; }
    catch (e) { return e.data?.title !== 'Not Found Error' ? Promise.reject(e) : false; }
  }
  try {
    const res = await axios.get(`https://twitter.com/${username}`, { headers: DEFAULT_HEADERS, validateStatus: s => s < 500 });
    return res.status === 200;
  } catch (e) { return e.response?.status === 404 ? false : Promise.reject(e); }
}

// 5. DockerHub (GET + content check)
async function checkDockerHub(username) {
  try {
    const res = await axios.get(`https://hub.docker.com/u/${username}`, { headers: DEFAULT_HEADERS, validateStatus: s => s < 500 });
    // DockerHub returns a generic page for missing users; detect by title or text
    const html = res.data;
    if (/We couldn't find that page/i.test(html) || res.status === 404) return false;
    return true;
  } catch (e) {
    return e.response?.status === 404 ? false : Promise.reject(e);
  }
}

// 6. Kaggle
async function checkKaggle(username) {
  const browser = await puppeteer.launch(PUPPETEER_OPTIONS);
  const page = await browser.newPage();
  await page.setUserAgent(DEFAULT_HEADERS['User-Agent']);
  const res = await page.goto(`https://www.kaggle.com/${username}`, { waitUntil: 'domcontentloaded' });
  const html = await page.content();
  await browser.close();
  if (res.status() === 404 || /Page Not Found/i.test(html)) return false;
  return true;
}

// 7. Codeforces
async function checkCodeforces(username) {
  try {
    const res = await axios.get(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(username)}`);
    return res.data.status === 'OK';
  } catch (e) {
    return e.response?.data?.status === 'FAILED' ? false : Promise.reject(e);
  }
}

app.post("/checkUsername", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username is required' });

  const checks = { github: checkGitHub, leetcode: checkLeetCode, hackerrank: checkHackerRank, twitter: checkTwitter, dockerhub: checkDockerHub, kaggle: checkKaggle, codeforces: checkCodeforces };
  const availability = {};

  await Promise.all(Object.entries(checks).map(async ([plat, fn]) => {
    try {
      const exists = await fn(username);
      // exists=true → taken → available=false; exists=false → free → available=true
      availability[plat] = { available: !exists };
    } catch {
      availability[plat] = { available: null };
    }
  }));

  res.json(availability);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server up on http://localhost:${PORT}`));