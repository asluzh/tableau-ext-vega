import { useEffect, useState } from 'react'
import { Tabs, Button } from '@tableau/tableau-ui';
import './Configure.css'
import SelectSheet from './components/SelectSheet';
import JsonSpec from './components/JsonSpec';
import EmbedOptions from './components/EmbedOptions';

// Declare this so our linter knows that tableau is a global object
/* global tableau */

export default function Configure(props) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  useEffect(() => {
    console.debug('[Configure.jsx] useEffect props changed:', props);
  }, [props]);

  useEffect(() => {
    console.debug('[Configure.jsx] useEffect');
    //Initialise Extension
    tableau.extensions.initializeDialogAsync().then((openPayload) => {
      console.log('[Configure.js] Initialise Dialog', openPayload);
    });
  }, []);

  function selectSheetHandler(name) {
    console.log('[Configure.jsx] selectSheetHandler', name);
  }

  function saveSettingsHandler() {
    console.log('[Configure.js] saveSettingsHandler - Saving Settings', props);
    // const meta = props.meta;
    // const label = props.label;
    // const style = props.style;
    // const filename = props.filename;
    // props.disableButton(false);
    // console.log('[Configure.js] saveSettingsHandler - sheets', meta);
    // setSettings('sheets', meta)
    //   .then(setSettings('label', label))
    //   .then(setSettings('style', style))
    //   .then(setSettings('filename', filename))
    //   .then(saveSettings())
    //   .then((savedSettings) => {
    //     console.log('[Configure.js] Saved Settings', savedSettings);
    //     props.changeSettings(false);
    //     let sheetSettings = tableau.extensions.settings.get('selectedSheets');
    //     if (sheetSettings && sheetSettings != null) {
    //       const existingSettings = JSON.parse(sheetSettings);
    //       console.log('[Configure.js] Sheet Settings Updated', existingSettings);
    //     }
    //   })
  }

  function resetSettingsHandler() {
    console.log('[Configure.js] resetSettingsHandler - Reset Settings');
    // initializeMeta()
    //   .then(meta => {
    //     props.updateMeta(meta);
    //   });
  }

  return (
      <>
        <Tabs
          activation='automatic'
          alignment='left'
          onTabChange={setSelectedTabIndex}
          selectedTabIndex={selectedTabIndex}
          tabs={[ { content: 'Select Data' }, { content: 'Vega Options' } ]}
          >
          <div>
          { selectedTabIndex === 0 ? <SelectSheet sheets={[{name: 'sheet1'},{name: 'sheet2'}]} selectSheet={selectSheetHandler} /> : null }
          { selectedTabIndex === 1 ? <EmbedOptions embedMode="vega-lite" /> : null }
          { selectedTabIndex === 1 ? <JsonSpec spec="" /> : null }
          </div>
        </Tabs>
        <div>
          <Button kind={'outline'} onClick={resetSettingsHandler}>Reset</Button>
          <Button kind={'primary'} onClick={saveSettingsHandler}>Save Changes</Button>
        </div>
      </>
  );
}
