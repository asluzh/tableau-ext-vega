import { useState } from 'react'
import { TextArea } from '@tableau/tableau-ui';

export default function StylingOptions(props) {
  const [mainDivStyle, setMainDivStyle] = useState(props.mainDivStyle);

  function updateMainDivStyle(event) {
    setMainDivStyle(event.target.value);
    props.updateStylingOptions({mainDivStyle: event.target.value});
  }

  return (
    <div style={{ marginTop: 20, marginBottom: 20 }}>
      <TextArea
        style={{ width: '530px', height: '50px', whiteSpace: 'pre', fontFamily: 'monospace' }}
        spellCheck={false}
        wrap='off'
        label="Main Div Style (CSS format)"
        value={mainDivStyle}
        placeholder="Enter CSS-style for main DIV element"
        onChange={updateMainDivStyle}
      />
    </div>
  );
}