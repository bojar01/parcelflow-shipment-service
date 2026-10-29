
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
    {
        ignores: [
            "node_modules/**",
            "dist/**",
            "generated/**",
            "coverage/**"
        ]
    },
    {
        files: ["**/*.ts"],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommendedTypeChecked
        ],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname
            }
        }
    },
    {
        files: ["**/*.test.ts"],
        rules: {
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-argument": "off"
        }
    }
);
