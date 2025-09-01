import { useState } from 'react'
import { TextArea } from '@tableau/tableau-ui';

export default function JsonSpec(props) {
  const [jsonSpec, setJsonSpec] = useState(props.spec);

  function handleChange(event) {
    setJsonSpec(event.target.value);
    props.updateJsonSpec(event.target.value);
  }

  return (
    <div style={{ marginTop: 20, marginBottom: 20 }}>
      <TextArea
        label="Vega/Vega-Lite JSON Specification"
        value={jsonSpec}
        onChange={handleChange}
        style={{ width: '300px', height: '240px' }}
      />
    </div>
  );
}