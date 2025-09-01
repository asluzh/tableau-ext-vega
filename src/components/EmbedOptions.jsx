import { useState } from 'react'
import { DropdownSelect } from '@tableau/tableau-ui';

export default function EmbedOptions(props) {
  const [embedMode, setEmbedMode] = useState(props.embedMode);

  function handleChange(event) {
    setEmbedMode(event.target.value);
    props.updateEmbedMode(event.target.value);
  }

  return (
    <div style={{ marginTop: 20, marginBottom: 20 }}>
      <DropdownSelect
        kind='line'
        label="Embed Mode"
        value={embedMode}
        onChange={handleChange}
        style={{ width: '300px' }}
      >
        <option value="vega">Vega</option>
        <option value="vega-lite">Vega-Lite</option>
      </DropdownSelect>
    </div>
  );
}