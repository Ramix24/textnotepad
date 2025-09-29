#!/usr/bin/env node

/**
 * Auto-version script
 * Automatically increments patch version on each commit
 * Can be run manually or via git hooks
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');

try {
  // Read current package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const currentVersion = packageJson.version;
  
  // Parse version components
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  // Increment patch version
  const newPatch = patch + 1;
  const newVersion = `${major}.${minor}.${newPatch}`;
  
  // Update package.json
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  
  console.log(`Version incremented: ${currentVersion} → ${newVersion}`);
  
  // Exit with success
  process.exit(0);
  
} catch (error) {
  console.error('Error incrementing version:', error.message);
  process.exit(1);
}