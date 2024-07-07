const { execSync } = require("child_process");

// Exécutez prisma generate après l'installation des dépendances
execSync("npx prisma generate", { stdio: "inherit" });
