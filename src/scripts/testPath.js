console.log("dirname:", __dirname);
console.log("cwd:", process.cwd());
console.log("os platform:", process.platform);

const path = require("path");
console.log("join dirname + ../prisma/schema.prisma =>");
console.log(path.join(__dirname, "../prisma/schema.prisma"));
