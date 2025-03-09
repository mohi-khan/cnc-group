import React from 'react';
import * as XLSX from 'xlsx';

function FileInput() {
  const [data, setData] = React.useState<object[] | null>(null);

interface FileInputEvent extends React.ChangeEvent<HTMLInputElement> {
    target: HTMLInputElement & EventTarget;
}

const handleFileUpload = (e: FileInputEvent): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>): void => {
        if (!event.target) return;
        const workbook = XLSX.read(event.target.result as string, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(sheet) as object[];

        setData(sheetData);
    };

    reader.readAsBinaryString(file);
};

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
      {data && (
        <div>
          <h2>Imported Data:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default FileInput;