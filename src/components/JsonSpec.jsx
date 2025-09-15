import { useState, useMemo } from 'react'
import { TextArea, Button } from '@tableau/tableau-ui';
import JSON5 from 'json5'

export default function JsonSpec(props) {
  const [jsonSpec, setJsonSpec] = useState(props.spec);
  const parsingMessage = useMemo(() => {
    try {
      JSON5.parse(jsonSpec);
    } catch (e) {
      return (`Invalid input: ${e.message}`);
    }
    return "Valid input";
  }, [jsonSpec]);

  function handleChange(event) {
    setJsonSpec(event.target.value);
    props.updateJsonSpec(event.target.value);
  }

  async function formatJson(btn) {
    try {
      let parsed = JSON5.parse(jsonSpec);
      let formatted = null;
      if (btn.target.name === "json5") {
        formatted = JSON5.stringify(parsed, null, 4);
      } else {
        formatted = JSON.stringify(parsed, null, 4);
      }
      setJsonSpec(formatted);
      props.updateJsonSpec(formatted);
    } catch (e) {
      console.error("Error in JSON:", e.message);
    }
  }

  return (
    <div style={{ marginTop: 20, marginBottom: 20 }}>
      <TextArea
        style={{ width: '530px', height: '350px', whiteSpace: 'pre', fontFamily: 'monospace' }}
        spellCheck={false}
        wrap='off'
        label="Vega/Vega-Lite Specification"
        value={jsonSpec}
        message={parsingMessage}
        placeholder="Enter your Vega or Vega-Lite specification here in JSON5 format"
        onChange={handleChange}
        valid={parsingMessage === "Valid input"}
      />
      <Button className="actionButton" kind="outline" density="high" onClick={formatJson} name="json">Format JSON</Button>
      <Button className="actionButton" kind="outline" density="high" onClick={formatJson} name="json5">Format JSON5</Button>
    </div>
  );
}