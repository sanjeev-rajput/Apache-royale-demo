
import 'dotenv/config';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse/sync';
import pg from 'pg';

const { Pool } = pg;

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.resolve(currentDir, '..');
const projectRoot = path.resolve(serverDir, '..');

const configPath = path.join(serverDir, 'import-csv-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const csvDirectory = path.resolve(serverDir, config.csvDirectory);

const REQUIRED_COLUMNS = [
    'Grade',
    'Topic',
    'Subtopic',
    'Activity Type',
    'Activity Name',
    'Location'
];

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'learning_catalog',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD
});

function loadCsvFile(filename) {
    if (path.basename(filename) !== filename ||
        path.extname(filename).toLowerCase() !== '.csv') {
        throw new Error(`Invalid CSV filename: ${filename}`);
    }

    const fullPath = path.resolve(csvDirectory, filename);

    if (!fs.existsSync(fullPath)) {
        throw new Error(`CSV file not found: ${fullPath}`);
    }

    const content = fs.readFileSync(fullPath, 'utf8');

    const records = parse(content, {
        columns: headers => headers.map(header => header.trim()),
        skip_empty_lines: true,
        trim: true,
        bom: true
    });

    if (records.length === 0) {
        throw new Error(`${filename} contains no data rows.`);
    }

    const actualColumns = Object.keys(records[0]);

    const missingColumns = REQUIRED_COLUMNS.filter(
        column => !actualColumns.includes(column)
    );

    if (missingColumns.length > 0) {
        throw new Error(
            `${filename} is missing required columns: ` +
            missingColumns.join(', ')
        );
    }

    
    const rows = records.map((record, index) => {
        const values = REQUIRED_COLUMNS.map(column =>
            String(record[column] ?? '').trim()
        );

        if (values.some(value => value === '')) {
            throw new Error(
                `${filename}: row ${index + 2} has an empty required field.`
            );
        }

        return {
            grade: values[0],
            topic: values[1],
            subtopic: values[2],
            activityType: values[3],
            activityName: values[4],
            description: String(record['Description'] ?? '').trim(),
            location: values[5],
            source: filename
        };
    });


    return rows;
}

async function importCsvFiles() {
    if (!Array.isArray(config.files) || config.files.length === 0) {
        throw new Error('Add at least one CSV filename to import-csv-config.json.');
    }

    // Load and validate every CSV before touching the database.
    const importedFiles = new Map();
    let totalRows = 0;

    for (const filename of config.files) {
        if (importedFiles.has(filename)) {
            throw new Error(`Duplicate filename in configuration: ${filename}`);
        }

        const rows = loadCsvFile(filename);
        importedFiles.set(filename, rows);
        totalRows += rows.length;

        console.log(`Validated ${filename}: ${rows.length} rows`);
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Delete existing records only inside this transaction.
        await client.query(
            'TRUNCATE TABLE learning_activities RESTART IDENTITY'
        );

        const insertSql = `
            INSERT INTO learning_activities (
                grade,
                topic,
                subtopic,
                activity_type,
                activity_name,
                description,
                location,
                source
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;

        for (const [filename, rows] of importedFiles) {
            for (const row of rows) {
                await client.query(insertSql, [
                    row.grade,
                    row.topic,
                    row.subtopic,
                    row.activityType,
                    row.activityName,
                    row.description,
                    row.location,
                    row.source
                ]);
            }

            console.log(`Imported ${filename}: ${rows.length} rows`);
        }

        const result = await client.query(
            'SELECT COUNT(*)::int AS count FROM learning_activities'
        );

        await client.query('COMMIT');

        console.log('\nImport completed successfully.');
        console.log(`Files processed: ${importedFiles.size}`);
        console.log(`Rows supplied: ${totalRows}`);
        console.log(`Rows now in database: ${result.rows[0].count}`);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

try {
    await importCsvFiles();
} catch (error) {
    console.error('\nImport failed:', error.message);
    process.exitCode = 1;
} finally {
    await pool.end();
}
