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

            // The codebase mixes tabs and 4 spaces, and some files are CRLF; not enforced.
            indent: "off",

            semi: ["error", "always"],
            "comma-dangle": ["error", "always-multiline"],
            "linebreak-style": "off",
            "no-inner-declarations": "off",

            // Hook and override signatures name arguments they don't use, and hook args are unpacked as tuples.
            "@typescript-eslint/no-unused-vars": ["error", {
                varsIgnorePattern: "_",
                args: "none",
                caughtErrors: "none",
                destructuredArrayIgnorePattern: ".",
            }],
            // `cond ? SendAction(a) : SendAction(b);` is the house style for picking a message.
            "@typescript-eslint/no-unused-expressions": ["error", {
                allowTernary: true,
                allowShortCircuit: true,
            }],
            // TypeScript already reports a case's let/const used before it's declared.
            "no-case-declarations": "off",
            // BC function patches use a plain function (its own `this`) and need the module's.
            "@typescript-eslint/no-this-alias": "off",
            // `x?.y!` is used as a type-only assertion; it behaves the same as `x?.y` at runtime.
            "@typescript-eslint/no-non-null-asserted-optional-chain": "off",

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
