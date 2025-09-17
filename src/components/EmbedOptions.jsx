import { useState, useMemo } from 'react'
import { TextArea, Button } from '@tableau/tableau-ui'
import JSON5 from 'json5'
import logger from '../utils/logger.js'

export default function EmbedOptions(props) {
  const [embedOptions, setEmbedOptions] = useState(props.options);
  const parsingMessage = useMemo(() => {
    try {
      JSON5.parse(embedOptions.replace(/(\r|\n)/g,''));
    } catch (e) {
      return (`Invalid input: ${e.message}`);
    }
    return "Valid input";
  }, [embedOptions]);

  function handleChange(event) {
    setEmbedOptions(event.target.value);
    props.updateEmbedOptions(event.target.value);
  }

  async function formatJson(btn) {
    try {
      let parsed = JSON5.parse(embedOptions.replace(/(\r|\n)/g,''));
      let formatted = null;
      if (btn.target.name === "json5") {
        formatted = JSON5.stringify(parsed, null, 2);
      } else {
        formatted = JSON.stringify(parsed, null, 2);
      }
      setEmbedOptions(formatted);
      props.updateEmbedOptions(formatted);
    } catch (e) {
      logger.error("Error in JSON:", e.message);
    }
  }

  return (
    <div style={{ marginTop: 20, marginBottom: 20 }}>
      <TextArea
        style={{ width: '530px', height: '350px', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
        spellCheck={false}
        wrap='off'
        label="Vega-Embed Options"
        value={embedOptions}
        message={parsingMessage}
        placeholder="Enter Vega-Embed options here in JSON5 format"
        onChange={handleChange}
        valid={parsingMessage === "Valid input"}
      />
      <Button className="actionButton" kind="outline" density="high" onClick={formatJson} name="json">Format JSON</Button>
      <Button className="actionButton" kind="outline" density="high" onClick={formatJson} name="json5">Format JSON5</Button>
    </div>
  );
}