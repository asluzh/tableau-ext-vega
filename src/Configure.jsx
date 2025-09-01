import { useEffect, useState } from 'react'
import { Tabs, Button } from '@tableau/tableau-ui';
import SelectSheet from './components/SelectSheet';
import JsonSpec from './components/JsonSpec';
import EmbedOptions from './components/EmbedOptions';
import './Configure.css'

// Declare this so our linter knows that tableau is a global object
/* global tableau */

export default function Configure(props) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [config, changeConfig] = useState({
    selectedSheet: "",
    jsonSpec: "",
    embedMode: "vega-lite",
  });

  useEffect(() => {
    console.debug('[Configure.jsx] useEffect props changed:', props);
  }, [props]);

  useEffect(() => {
    console.debug('[Configure.jsx] useEffect');
    //Initialise Extension
    tableau.extensions.initializeDialogAsync().then((openPayload) => {
      console.debug('[Configure.jsx] Initialize Dialog', openPayload);
    });
  }, []);

  function selectSheetHandler(name) {
    console.debug('[Configure.jsx] selectSheetHandler', name);
    changeConfig(prevConfig => ({...prevConfig,
      selectedSheet: name
    }));
  }

  function embedModeHandler(mode) {
    console.debug('[Configure.jsx] embedModeHandler', mode);
    changeConfig(prevConfig => ({...prevConfig,
      embedMode: mode
    }));
  }

  function jsonSpecHandler(spec) {
    console.debug('[Configure.jsx] jsonSpecHandler', spec);
    changeConfig(prevConfig => ({...prevConfig,
      jsonSpec: spec
    }));
  }

  function saveSettingsHandler() {
    console.debug('[Configure.jsx] saveSettingsHandler');
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
    console.debug('[Configure.jsx] resetSettingsHandler');
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
          <div className='configBody'>
          { selectedTabIndex === 0 ? <SelectSheet sheets={[{name: 'sheet1'},{name: 'sheet2'}]} selectedSheet={config.selectedSheet} updateSheet={selectSheetHandler} /> : null }
          { selectedTabIndex === 1 ? <EmbedOptions embedMode={config.embedMode} updateEmbedMode={embedModeHandler} /> : null }
          { selectedTabIndex === 1 ? <JsonSpec spec={config.jsonSpec} updateJsonSpec={jsonSpecHandler} /> : null }
          </div>
        </Tabs>
        <div>
          <Button kind={'outline'} onClick={resetSettingsHandler}>Reset</Button>
          <Button kind={'primary'} onClick={saveSettingsHandler}>Save Changes</Button>
        </div>
      </>
  );
}
