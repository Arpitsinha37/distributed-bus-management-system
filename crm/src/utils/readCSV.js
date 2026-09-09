import Papa from "papaparse";

export const readCSV = (filePath, callback) => {
  Papa.parse(filePath, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: (result) => {
      callback(result.data);
    },
  });
};
