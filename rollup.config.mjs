// rollup.config.js
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import resolve from "@rollup/plugin-node-resolve";
import progress from 'rollup-plugin-progress';

export default {
  input: 'src/main.ts',
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
`
  },
  treeshake: false,
  plugins: [
    progress({ clearLine: true }),
		resolve({ browser: true }),
		json(),
    typescript({ tsconfig: "./tsconfig.json", inlineSources: true }),
    commonjs()
  ]
};