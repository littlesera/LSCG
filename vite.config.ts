import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import packageJson from "./package.json";

// Calculate your version string once
const LSCG_VERSION = (packageJson.version.length > 0 && packageJson.version[0] === 'v') 
    ? packageJson.version 
    : "v" + packageJson.version;

const bannerCode = `// LSCG: Little Sera's Club Games
if (typeof window.ImportBondageCollege !== "function") {
  alert("Club not detected! Please only use this while you have Club open!");
  throw "Dependency not met";
}
if (window.LSCG_Loaded !== undefined) {
  alert("LSCG is already detected in current window. To reload, please refresh the window.");
  throw "Already loaded";
}
window.LSCG_Loaded = false;
console.debug("LSCG: Parse start...");\n`;

export default defineConfig(({ mode }) => {
    // Check if we are running the 'watch' script
    const isDev = mode === 'development';

    return {
        plugins: [
            tsconfigPaths(),
            cssInjectedByJsPlugin() 
        ],
        esbuild: {
            minifyIdentifiers: false, 
            minifySyntax: true,       
            minifyWhitespace: true,   
        },
        build: {
            target: 'esnext',
            emptyOutDir: false, 
            minify: 'esbuild', 
            
            // Toggle sourcemap based on the mode!
            sourcemap: isDev ? 'inline' : false, 
            
            lib: {
                entry: 'src/main.tsx',
                name: 'LSCG',
                formats: ['iife'],
                fileName: () => 'bundle.js'
            },
            rollupOptions: {
                output: {
                    banner: bannerCode,
                    intro: `const LSCG_VERSION="${LSCG_VERSION}";`
                },
                onwarn(warning, warn) {
                    if (warning.code === 'EVAL' || warning.code === 'CIRCULAR_DEPENDENCY') return;
                    warn(warning);
                }
            }
        }
    };
});