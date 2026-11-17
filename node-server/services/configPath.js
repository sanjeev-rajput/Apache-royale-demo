import "./env.js";

import path from "node:path";
import fs from "node:fs";
/**
 * Returns the absolute configuration directory.
 *
 * Local development:
 * LEARNING_CONFIG_DIR=../src/config
 *
 * Render deployment:
 * LEARNING_CONFIG_DIR=./config
 *
 * Relative paths are resolved against process.cwd().
 */
export function getConfigDir() {
    const configuredPath = process.env.LEARNING_CONFIG_DIR;

    if (!configuredPath || !configuredPath.trim()) {
        throw new Error(
            "[CONFIG] LEARNING_CONFIG_DIR is not configured."
        );
    }

    const resolvedPath = path.resolve(
        process.cwd(),
        configuredPath.trim()
    );

    if (!fs.existsSync(resolvedPath)) {
        throw new Error(
            `[CONFIG] Configuration directory not found: ${resolvedPath}`
        );
    }

    if (!fs.statSync(resolvedPath).isDirectory()) {
        throw new Error(
            `[CONFIG] Configuration path is not a directory: ${resolvedPath}`
        );
    }

    return resolvedPath;
}

/**
 * Returns an absolute path for a file or directory
 * inside the configured configuration directory.
 *
 * Examples:
 * getConfigPath("learning-language.json")
 * getConfigPath("learning-catalogs.json")
 * getConfigPath("profiles", "english_primary.json")
 */
export function getConfigPath(...segments) {
    return path.resolve(getConfigDir(), ...segments);
}
