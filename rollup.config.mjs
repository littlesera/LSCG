
import { readFileSync } from 'fs';
import commonjs from '@rollup/plugin-commonjs';
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from '@rollup/plugin-typescript';
import progress from 'rollup-plugin-progress';
const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)));

export default {
  input: 'src/main.ts',
  output: {
    name: "LSCG",
    file: 'dist/bundle.js',
    format: 'iife',
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
      return `const LSCG_VERSION="${packageJson.version}";`;
    },
    plugins: [terser({
      mangle: false
    })]
  },
  treeshake: false,
  plugins: [
    progress({ clearLine: true }),
    resolve({ browser: true }),
    typescript({ tsconfig: "./tsconfig.json", inlineSources: true }),
    commonjs(),
  ]
};
