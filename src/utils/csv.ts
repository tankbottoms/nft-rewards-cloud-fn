import { parse } from "csv-parse/sync";

export function parseCsv(content: string | Buffer) {
  const result = parse(content, {
    columns: true,
    skip_empty_lines: true,
  });
  for (let i = 0; i < result.length; i++) {
    const row = result[i];
    const obj = {};
    Object.keys(row).forEach((key) => {
      const _key = key.trim();
      obj[_key] = row[key];
    });
    result[i] = obj;
  }
  return result;
}
