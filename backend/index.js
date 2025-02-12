import express from "express";
import cors from "cors";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import dotenv from 'dotenv';
dotenv.config();
puppeteer.use(StealthPlugin()); 
const app = express();
app.use(cors());
app.use(express.json());
const LOGIN_URL = "https://www.linkedin.com/login";
const FEED_URL = "https://www.linkedin.com/feed/";
const USERNAME = process.env.LINKEDIN_EMAIL;
const PASSWORD = process.env.LINKEDIN_PASSWORD;
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
            console.log("Successfully logged into LinkedIn!");
            return true;
        } else {
            console.error("Login failed! Check credentials or CAPTCHA.");
            return false;
        }
    } catch (error) {
        console.error("Login failed or took too long!", error);
        return false;
    }
}
app.post("/checkUsername", async (req, res) => {
    const { username } = req.body;
    const availability = {
        linkedin: false,
        github: false,
        leetcode: false,
    };
    const links = [
        { name: "linkedin", url: `https://www.linkedin.com/in/${username}/` },
        { name: "github", url: `https://www.github.com/${username}/` },
        { name: "leetcode", url: `https://www.leetcode.com/u/${username}/` },
    ];
    try {
        console.log("Launching browser...");
        const browser = await puppeteer.launch({ headless: "new" });
        // const browser = await puppeteer.launch({ headless: false, slowMo: 500 });
        const page = await browser.newPage();
        await loginToLinkedIn(page);
        for (const link of links) {
            console.log(`Checking ${link.name}...`);
            const response = await page.goto(link.url, { waitUntil: "domcontentloaded", timeout: 15000 });
            // console.log(response);
            // console.log(response.status());
            
            
            const linkedinURL = "https://www.linkedin.com/404/";
            const currURL = page.url();
            
            console.log(currURL);
            if(link.name === "linkedin" && linkedinURL === currURL){
                availability[link.name] = true;
            }else if(response.status() !== 404) {
                availability[link.name] = false;
            }else{
                availability[link.name] = true;
            }
        }
        await browser.close();
        console.log("Verification complete.");
    } catch (error) {
        console.error("Error checking usernames:", error);
    }
    res.json(availability);
});
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// export default app;