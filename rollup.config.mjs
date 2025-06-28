// rollup.config.js
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import progress from 'rollup-plugin-progress';
import scss from "rollup-plugin-scss";
import serve from 'rollup-plugin-serve'
import simpleGit from "simple-git";

import packageJson from "./package.json" with { type: "json" };

/**
 * Increment the package version if it is lower than or equal to the latest git tag.
 * @param {string} pkgVersion
 * @param {string} gitVersion
 * @returns {string}
 */
function incrementVersion(pkgVersion, gitVersion) {
    const version_pattern = /^(v?)([0-9]+)\.([0-9]+)\.([0-9]+)$/;
    const gitExec = version_pattern.exec(gitVersion);
    const pkgExec = version_pattern.exec(pkgVersion);
    if (gitExec === null || pkgExec === null) {
        const version = gitExec === null ? gitVersion : pkgVersion;
        console.error(`LSCG: Failed to parse version "${version}"`);
        return pkgVersion;
    }

    const gitArray = gitExec.slice(2, 5).map(i => Number.parseInt(i, 10));
    const pkgArray = pkgExec.slice(2, 5).map(i => Number.parseInt(i, 10));
    for (let i=0; i < 3; i++) {
        if (pkgArray[i] > gitArray[i]) {
            return pkgVersion;
        } else if (pkgArray[i] !== gitArray[i]) {
            break;
        }
    }

    // Automatically increment the micro version by 1 w.r.t. the latest release if we haven't done so manually
    gitArray[2] += 1;
    return gitArray.join(".");
}

export default {
  input: 'src/main.tsx',
  output: {
    name: "LSCG",
    file: 'dist/bundle.js',
    format: 'iife',
    sourcemap: true,
		banner: `// LSCG: Little Sera's Club Games
if (typeof window.ImportBondageCollege !== "function") {
  alert("Club not detected! Please only use this while you have Club open!");
  throw "Dependency not met";
}
if (window.LSCG_Loaded !== undefined) {
  alert("LSCG is already detected in current window. To reload, please refresh the window.");
  throw "Already loaded";
}
window.LSCG_Loaded = false;
console.debug("LSCG: Parse start...");
`,
    intro: async () => {
      // let LSCG_VERSION = packageJson.version;
      // const git = simpleGit();
      // const latestTag = (await git.tags()).latest;
      // devsuffix: {
      //     if (latestTag === undefined) {
      //         console.error("LSCG: Failed to load git tags");
      //         break devsuffix;
      //     }

      //     // Grab all commits since the latest release
      //     const commits = (await git.log({ from: latestTag })).all;
      //     if (commits.length === 0) {
      //         console.log(`LSCG: No new commits since the "${latestTag}" tag`);
      //         break devsuffix;
      //     } else {
      //         LSCG_VERSION = incrementVersion(LSCG_VERSION, latestTag);
      //     }

      //     const hash = commits[0].hash;
      //     LSCG_VERSION += `.dev${commits.length - 1}+${hash.slice(0, 8)}`;
      //     console.log(`LSCG: Updated version "${packageJson.version}" to "${LSCG_VERSION}"`);
      // }
      // LSCG_VERSION = (LSCG_VERSION.length > 0 && LSCG_VERSION[0] == 'v') ? LSCG_VERSION : "v" + LSCG_VERSION;
      // return `const LSCG_VERSION="${LSCG_VERSION}"`;
      let LSCG_VERSION = packageJson.version;
      LSCG_VERSION = (LSCG_VERSION.length > 0 && LSCG_VERSION[0] == 'v') ? LSCG_VERSION : "v" + LSCG_VERSION;
      return `const LSCG_VERSION="${LSCG_VERSION}";`;
    },
    plugins: [terser({
      mangle: false,
      compress: true
    })]
  },
  treeshake: true,
  plugins: [
    progress({ clearLine: true }),
		resolve({ browser: true }),
    typescript({ tsconfig: "./tsconfig.json", inlineSources: true }),
    commonjs(),
    scss({ output: false }),
    serve({
      contentBase: 'dist',
      port: 10001,
      host: "localhost",
      headers: {
        'Access-Control-Allow-Origin': '*', // Allows requests from any origin
        'Access-Control-Allow-Methods': 'GET', // Allowed HTTP methods
        'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Allowed request headers
      },
      compress: true
    })
  ],
  onwarn(warning, warn) {
        switch (warning.code) {
            case "EVAL":
            case "CIRCULAR_DEPENDENCY":
                return;
            default:
                warn(warning);
        }
    },
};