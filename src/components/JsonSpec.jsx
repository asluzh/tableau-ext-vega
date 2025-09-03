import { useState, useMemo } from 'react'
import { TextArea } from '@tableau/tableau-ui';

export default function JsonSpec(props) {
  const [jsonSpec, setJsonSpec] = useState(props.spec);
  const parsingMessage = useMemo(() => {
    try {
      JSON.parse(jsonSpec);
    } catch (e) {
      return (`Invalid JSON input: ${e.message}`);
    }
    return "Valid JSON input";
  }, [jsonSpec]);

  function handleChange(event) {
    setJsonSpec(event.target.value);
    props.updateJsonSpec(event.target.value);
  }

  return (
    <div style={{ marginTop: 20, marginBottom: 20 }}>
      <TextArea
        style={{ width: '500px', height: '330px' }}
        label="Vega/Vega-Lite JSON Specification"
        value={jsonSpec}
        maxLength={props.maxLength}
        message={`${jsonSpec.length}/${props.maxLength} characters. ${parsingMessage}.`}
        placeholder="Enter your Vega or Vega-Lite JSON specification here"
        onChange={handleChange}
        valid={parsingMessage === "Valid JSON input" && jsonSpec.length > 0 && jsonSpec.length <= props.maxLength}
      />
    </div>
  );
}