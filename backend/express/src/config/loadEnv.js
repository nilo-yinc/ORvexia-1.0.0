const path = require("path");
const dotenv = require("dotenv");

const envPaths = [
  path.resolve(__dirname, "../../../../.env"),
  path.resolve(__dirname, "../../../.env"),
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../.env"),
];

for (const envPath of envPaths) {
  dotenv.config({ path: envPath, quiet: true });
}
