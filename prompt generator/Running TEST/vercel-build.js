const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "Running sam.html");
const outputDir = path.join(__dirname, "vercel-dist");
const target = path.join(outputDir, "index.html");

if (!fs.existsSync(source)) {
  throw new Error("Running sam.html file is missing.");
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });
fs.copyFileSync(source, target);
fs.copyFileSync(path.join(__dirname, "styles.css"), path.join(outputDir, "styles.css"));
fs.copyFileSync(path.join(__dirname, "app.js"), path.join(outputDir, "app.js"));

const apiSource = path.join(__dirname, "api", "recommend.js");
const apiOutputDir = path.join(outputDir, "api");
const apiTarget = path.join(apiOutputDir, "recommend.js");

if (fs.existsSync(apiSource)) {
  fs.mkdirSync(apiOutputDir, { recursive: true });
  fs.copyFileSync(apiSource, apiTarget);
}

console.log("Vercel build prepared vercel-dist with HTML, CSS, JS, and API");
