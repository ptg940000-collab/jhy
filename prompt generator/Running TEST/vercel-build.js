const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "Running sam.html");
const target = path.join(__dirname, "index.html");

if (!fs.existsSync(source)) {
  throw new Error("Running sam.html file is missing.");
}

fs.copyFileSync(source, target);
console.log("Vercel build prepared index.html from Running sam.html");

