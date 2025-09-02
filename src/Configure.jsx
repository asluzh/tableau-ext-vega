import { useEffect, useState } from 'react'
import { Tabs, Button } from '@tableau/tableau-ui';
import SelectSheet from './components/SelectSheet';
import JsonSpec from './components/JsonSpec';
import EmbedOptions from './components/EmbedOptions';
import './Configure.css'

// Declare this so our linter knows that tableau is a global object
/* global tableau */

export default function Configure() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [sheets, setSheets] = useState([]);
  const [config, changeConfig] = useState({
    selectedSheet: "",
    embedMode: "vega-lite",
    jsonSpec: "",
  });

  useEffect(() => {
    console.debug('[Configure.jsx] useEffect');
    //Initialise Extension
    tableau.extensions.initializeDialogAsync().then((openPayload) => {
      console.debug('[Configure.jsx] Initialize Dialog', openPayload);
      setSheets(tableau.extensions.dashboardContent.dashboard.worksheets);
      let selectedSheet = tableau.extensions.settings.get('selectedSheet');
      if (selectedSheet) {
        selectSheetHandler(selectedSheet);
      }
      let embedMode = tableau.extensions.settings.get('embedMode');
      if (embedMode) {
        embedModeHandler(embedMode);
      }
      let jsonSpec = tableau.extensions.settings.get('jsonSpec');
      if (jsonSpec) {
        jsonSpecHandler(jsonSpec);
      }
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

  function saveSettingsHandler(btn) {
    console.debug('[Configure.jsx] saveSettingsHandler', btn);
    tableau.extensions.settings.set('selectedSheet', config.selectedSheet);
    tableau.extensions.settings.set('embedMode', config.embedMode);
    tableau.extensions.settings.set('jsonSpec', config.jsonSpec);
    tableau.extensions.settings.saveAsync().then(() => {
      console.debug('[Configure.jsx] Settings saved');
      if (btn.target.name === "save") {
        tableau.extensions.ui.closeDialog('Save and close');
      }
    });
  }

  function closeHandler(btn) {
    console.debug('[Configure.jsx] closeHandler', btn);
    tableau.extensions.ui.closeDialog('Close');
  }

  function resetSettingsHandler() {
    console.debug('[Configure.jsx] resetSettingsHandler');
    let selectedSheet = tableau.extensions.settings.get('selectedSheet');
    if (selectedSheet) {
      selectSheetHandler(selectedSheet);
    }
    let embedMode = tableau.extensions.settings.get('embedMode');
    if (embedMode) {
      embedModeHandler(embedMode);
    }
    let jsonSpec = tableau.extensions.settings.get('jsonSpec');
    if (jsonSpec) {
      jsonSpecHandler(jsonSpec);
    }
    setSelectedTabIndex(0);
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
          { selectedTabIndex === 0 ? <SelectSheet sheets={sheets} selectedSheet={config.selectedSheet} updateSheet={selectSheetHandler} /> : null }
          { selectedTabIndex === 1 ? <EmbedOptions embedMode={config.embedMode} updateEmbedMode={embedModeHandler} /> : null }
          { selectedTabIndex === 1 ? <JsonSpec spec={config.jsonSpec} updateJsonSpec={jsonSpecHandler} /> : null }
          </div>
        </Tabs>
        <div>
          <Button kind="destructive" density="high" onClick={closeHandler} name="close">Close</Button>
          <Button kind="outline" density="high" onClick={resetSettingsHandler} name="reset">Reset</Button>
          <Button kind="outline" density="high" onClick={saveSettingsHandler} name="apply">Apply</Button>
          <Button kind="primary" density="high" onClick={saveSettingsHandler} name="save">Apply & Close</Button>
        </div>
      </>
  );
}
