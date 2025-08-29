import { useState } from 'react'
import { DropdownSelect } from '@tableau/tableau-ui';

export default function EmbedOptions(props) {
  const [embedOption, setEmbedOption] = useState(props.embedMode);

  return (
    <div>
      <DropdownSelect
        kind='line'
        label="Embed Mode"
        value={embedOption}
        onChange={e => setEmbedOption(e.target.value)}
        style={{ width: '300px' }}
      >
        <option value="vega">Vega</option>
        <option value="vega-lite">Vega-Lite</option>
      </DropdownSelect>
    </div>
  );
}