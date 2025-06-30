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

const config = {
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
    scss({ output: false })
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

if (process.env.ROLLUP_WATCH) {
    config.plugins.push(
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
    );
}

export default config;