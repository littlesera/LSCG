import css from "eslint-plugin-css";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    {
        ignores: ["**/dist/", "**/*.scss.d.ts"],
    },
    ...compat.extends(
        "eslint:recommended",
        "plugin:css/recommended",
        "plugin:@typescript-eslint/recommended",
    ),
    {
        plugins: {
            css,
            "@typescript-eslint": typescriptEslint,
        },

        languageOptions: {
            globals: {
                ...globals.browser,
            },

            ecmaVersion: "latest",
            sourceType: "module",

            parserOptions: {
                project: "tsconfig.json",
            },
        },

        rules: {
            "no-throw-literal": ["error"],

            quotes: ["error", "double", {
                avoidEscape: true,
            }],

            indent: ["error", 4, {
                SwitchCase: 1,
            }],

            semi: ["error", "always"],
            "comma-dangle": ["error", "always-multiline"],
            "linebreak-style": ["error", "unix"],
            "no-inner-declarations": "off",

            "@typescript-eslint/no-unused-vars": ["error", {
                varsIgnorePattern: "_",
                argsIgnorePattern: "_",
            }],

            "@typescript-eslint/no-inferrable-types": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-namespace": "off",
            "@typescript-eslint/no-empty-object-type": ["error", {
                allowInterfaces: "with-single-extends",
            }],

            "css/no-unknown-unit": ["error", {
                ignoreUnits: ["dvh", "dvw"],
            }],
        },
    },
    {
        ignores: [
            "**/*.config.mjs",
            "**/*.user.js"
        ],
    },
];
