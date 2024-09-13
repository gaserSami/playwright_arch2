import * as fs from 'fs';
import csvParser from 'csv-parser';

interface GeoTarget {
  "Criteria ID": string;
  "Name": string;
}

interface langTarget {
  "Language name" : string;
  "Criterion ID" : string;
}

// Helper function to load and parse the CSV file
async function loadGeoTargets(csvFilePath: string): Promise<GeoTarget[]> {
  return new Promise((resolve, reject) => {
    const results: GeoTarget[] = [];
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

// helper function to load and parse the CSV file
async function loadLangTargets(csvFilePath: string): Promise<langTarget[]> {
  return new Promise((resolve, reject) => {
    const results: langTarget[] = [];
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

export { loadGeoTargets, GeoTarget , loadLangTargets, langTarget };