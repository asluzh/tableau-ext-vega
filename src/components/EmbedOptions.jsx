import { useState, useMemo } from 'react'
import { TextArea, Button } from '@tableau/tableau-ui';
import StringToJson from '../helpers/StringToJson';

export default function EmbedOptions(props) {
  const [embedOptions, setEmbedOptions] = useState(props.options);
  const parsingMessage = useMemo(() => {
    try {
      JSON.parse(embedOptions);
    } catch (e) {
      return (`Invalid JSON input: ${e.message}`);
    }
    return "Valid JSON input";
  }, [embedOptions]);

  function handleChange(event) {
    setEmbedOptions(event.target.value);
    props.updateEmbedOptions(event.target.value);
  }

  async function formatJson() {
    try {
      let parsed = JSON.parse(embedOptions);
      console.log(StringToJson(embedOptions));
      let formatted = JSON.stringify(parsed, null, 4);
      setEmbedOptions(formatted);
      props.updateJsonSpec(formatted);
    } catch (e) {
      return (`Error in JSON: ${e.message}`);
    }
  }

  return (
    <div style={{ marginTop: 20, marginBottom: 20 }}>
      <TextArea
        style={{ width: '550px', height: '350px' }}
        label="Vega-Embed Options"
        value={embedOptions}
        message={parsingMessage}
        placeholder="Enter Vega-Embed options here"
        onChange={handleChange}
        valid={parsingMessage === "Valid JSON input"}
      />
      <Button className="actionButton" kind="outline" density="high" onClick={formatJson} name="close">Format JSON</Button>
    </div>
  );
}