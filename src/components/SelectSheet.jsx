import { useState, useEffect } from 'react'
import { DropdownSelect } from '@tableau/tableau-ui'
import logger from '../utils/logger.js'

export default function SelectSheet(props) {
  const [sheet, setSheet] = useState(props.sheet);

  useEffect(() => {
    logger.debug('useEffect props', props);
    setSheet(props.sheet);
  }, [props]);

  function handleChange(event) {
    setSheet(event.target.value);
    props.updateSheet(event.target.value);
  }

  return (
    <div style={{ marginTop: 20, marginBottom: 20 }}>
      <DropdownSelect
        kind='outline'
        label="Select Data Source Sheet"
        value={sheet}
        onChange={handleChange}
        style={sheet ? {} : { border: '1px solid red' }}
      >
        <option key="" value=""> -- Please select -- </option>
        {props.sheets.map((s) => ( <option key={s.name} value={s.name}>{s.name}</option> ))}
      </DropdownSelect>
    </div>
  );
}