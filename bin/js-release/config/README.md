# Manifest-driven learning catalog

## Files to copy

1. Replace `node-server/services/learningCatalog.js` with the included `learningCatalog.js`.
2. Add `src/config/learning-catalogs.json` using the included manifest.

Keep the existing CSV files in `src/config/`:
- `toc-dr-1.csv`
- `toc-dr-2.csv`

## Adding another CSV

Place the new CSV in `src/config/`, then add one entry to `learning-catalogs.json`:

```json
{
  "id": "english-extra",
  "file": "toc-dr-3.csv",
  "enabled": true,
  "subject": "English"
}
```

Do not change existing CSV headers, column order, or cell values. The manifest is separate from the CSV data.

## Compatibility and behavior

- Existing search functions and returned activity fields are preserved.
- The `source` field continues to contain the CSV filename.
- CSV files are loaded in manifest order.
- Entries with `enabled: false` are skipped.
- Duplicate filenames and paths outside `src/config/` are rejected.
- The catalog reloads when the manifest or a listed CSV's modification time/size changes.
- If the manifest is absent, the service temporarily falls back to the two legacy filenames.

`subject` and `id` are metadata for catalog administration; this version does not add them to activity result objects or alter current search behavior.
