import { useState } from 'react'
import { DropdownSelect } from '@tableau/tableau-ui';

export default function SelectSheet(props) {
  const [selectedSheet, setSelectedSheet] = useState(props.selectedSheet);

  function handleChange(event) {
    setSelectedSheet(event.target.value);
    props.updateSheet(event.target.value);
  }

  return (
    <div style={{ marginTop: 20, marginBottom: 20 }}>
      <DropdownSelect
        kind='outline'
        label="Select Data Source Sheet"
        value={selectedSheet}
        onChange={handleChange}
      >
        <option key="" value="">...</option>
        {props.sheets.map((sheet) => (
          <option key={sheet.name} value={sheet.name}>
            {sheet.name}
          </option>
        ))}
      </DropdownSelect>
    </div>
  );
}