import { useState } from 'react'
import { TextArea } from '@tableau/tableau-ui';

export default function JsonSpec(props) {
  const [jsonSpec, setJsonSpec] = useState(props.spec);

  return (
    <div>
      <TextArea
        label="Vega/Vega-Lite JSON Specification"
        value={jsonSpec}
        onChange={e => setJsonSpec(e.target.value)}
        style={{ width: '300px', height: '250px' }}
      />
    </div>
  );
}