// Quick sanity test of the compliance engine without running the UI.
// Run: node --experimental-strip-types scripts/sanity.mjs (Node 22+)
import { execSync } from 'node:child_process';
execSync('npx tsx scripts/sanity.ts', { stdio: 'inherit' });
