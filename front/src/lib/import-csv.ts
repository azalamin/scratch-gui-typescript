/* eslint-disable import/no-anonymous-default-export */
import Papa from 'papaparse';

export default () =>
  new Promise((resolve, reject) => {
    const fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', '.csv, .tsv, .txt'); // parser auto-detects delimiter
    fileInput.onchange = (e: any) => {
      const file = e.target.files[0];
      Papa.parse(file, {
        header: false,
        complete: (results: any) => {
          document.body.removeChild(fileInput);
          resolve(results.data);
        },
        error: (err: any) => {
          document.body.removeChild(fileInput);
          reject(err);
        },
      });
    };
    document.body.appendChild(fileInput);
    fileInput.click();
  });
