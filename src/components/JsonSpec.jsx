import { useState, useMemo } from 'react'
import { TextArea, Button } from '@tableau/tableau-ui';
import StringToJson from '../helpers/StringToJson';

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

  async function formatJson() {
    try {
      let parsed = JSON.parse(jsonSpec);
      console.log(StringToJson(jsonSpec));
      let formatted = JSON.stringify(parsed, null, 4);
      setJsonSpec(formatted);
      props.updateJsonSpec(formatted);
    } catch (e) {
      return (`Error in JSON: ${e.message}`);
    }
  }

  return (
    <div style={{ marginTop: 20, marginBottom: 20 }}>
      <TextArea
        style={{ width: '600px', height: '300px' }}
        label="Vega/Vega-Lite JSON Specification"
        value={jsonSpec}
        message={parsingMessage}
        placeholder="Enter your Vega or Vega-Lite JSON specification here"
        onChange={handleChange}
        valid={parsingMessage === "Valid JSON input"}
      />
      <Button className="actionButton" kind="outline" density="high" onClick={formatJson} name="close">Format JSON</Button>
    </div>
  );
}