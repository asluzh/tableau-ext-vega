import { useEffect, useState } from 'react'
import { Tabs, Button } from '@tableau/tableau-ui';
import SelectSheet from './components/SelectSheet';
import JsonSpec from './components/JsonSpec';
import EmbedOptions from './components/EmbedOptions';
import './Configure.css'

// Declare this so our linter knows that tableau is a global object
/* global tableau */

const CONFIG_META_VERSION = 1;

export default function Configure() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [sheets, setSheets] = useState([]);
  const [config, changeConfig] = useState({
    metaVersion: CONFIG_META_VERSION,
    sheet: "",
    // listenerFilterEvent: true,
    // listenerDataChanged: true,
    embedMode: "vega-lite",
    jsonSpec: "{}",
  });
  // const maxSpecLength = 10000; // total workbook length limit is 2MB, so the character limit is rarely a problem

  useEffect(() => {
    console.debug('[Configure.jsx] useEffect');
    //Initialise Extension
    tableau.extensions.initializeDialogAsync().then((openPayload) => {
      console.debug('[Configure.jsx] Initialize Dialog', openPayload);
      setSheets(tableau.extensions.dashboardContent.dashboard.worksheets);
      let metaVersion = parseInt(tableau.extensions.settings.get('metaVersion'));
      console.debug('[Configure.jsx] meta version', metaVersion);
      if (metaVersion > CONFIG_META_VERSION) {
        console.error('[Configure.jsx] newer meta version detected in settings!')
      } else if (metaVersion < CONFIG_META_VERSION) {
        console.log('[Configure.jsx] older meta version detected in settings, ignoring config')
      } else {
        let sheet = tableau.extensions.settings.get('sheet');
        if (sheet) {
          updateSheet(sheet);
        }
        let embedMode = tableau.extensions.settings.get('embedMode');
        if (embedMode) {
          updateEmbedMode(embedMode);
        }
        let jsonSpec = tableau.extensions.settings.get('jsonSpec');
        if (jsonSpec) {
          updateJsonSpec(jsonSpec);
        }
      }
    });
  }, []);

  function updateSheet(name) {
    console.debug('[Configure.jsx] updateSheet', name);
    changeConfig(prevConfig => ({...prevConfig,
      sheet: name
    }));
  }

  function updateEmbedMode(mode) {
    console.debug('[Configure.jsx] updateEmbedMode', mode);
    changeConfig(prevConfig => ({...prevConfig,
      embedMode: mode
    }));
  }

  function updateJsonSpec(spec) {
    console.debug('[Configure.jsx] updateJsonSpec', spec);
    changeConfig(prevConfig => ({...prevConfig,
      jsonSpec: spec
    }));
  }

  function validInputs() {
    if (!config.sheet) {
      console.debug('[Configure.jsx] sheet empty');
      return false;
    }
    if (!config.embedMode) {
      console.debug('[Configure.jsx] embedMode empty');
      return false;
    }
    // if (!config.jsonSpec.length > maxSpecLength) {
    //   console.debug('[Configure.jsx] jsonSpec too long');
    //   return false;
    // }
    try {
      JSON.parse(config.jsonSpec);
    } catch (e) {
      console.debug('[Configure.jsx] invalid jsonSpec', e);
      return false;
    }
    return true;
  }

  function saveSettings(btn) {
    console.debug('[Configure.jsx] saveSettings', btn);
    tableau.extensions.settings.set('metaVersion', config.metaVersion);
    tableau.extensions.settings.set('sheet', config.sheet);
    tableau.extensions.settings.set('embedMode', config.embedMode);
    tableau.extensions.settings.set('jsonSpec', config.jsonSpec);
    if (validInputs()) {
      tableau.extensions.settings.saveAsync().then(() => {
        console.debug('[Configure.jsx] Settings saved');
        if (btn.target.name === "save") {
          tableau.extensions.ui.closeDialog('Save and close');
        }
      },(err) => {
        window.alert('Saving settings failed! ' + err.toString());
      });
    }
  }

  function closeSettings(btn) {
    console.debug('[Configure.jsx] closeSettings', btn);
    tableau.extensions.ui.closeDialog('Close');
  }

  function resetSettings() {
    console.debug('[Configure.jsx] resetSettings');
    let sheet = tableau.extensions.settings.get('sheet');
    if (sheet) {
      updateSheet(sheet);
    }
    let embedMode = tableau.extensions.settings.get('embedMode');
    if (embedMode) {
      updateEmbedMode(embedMode);
    }
    let jsonSpec = tableau.extensions.settings.get('jsonSpec');
    if (jsonSpec) {
      updateJsonSpec(jsonSpec);
    }
    setSelectedTabIndex(0);
  }

  return (
      <div>
        <Tabs
          activation='automatic'
          alignment='left'
          onTabChange={setSelectedTabIndex}
          selectedTabIndex={selectedTabIndex}
          tabs={[ { content: 'Select Data' }, { content: 'Vega Options' } ]}
          >
          <div className='configForm'>
          { selectedTabIndex === 0 ? <SelectSheet sheets={sheets} sheet={config.sheet} updateSheet={updateSheet} /> : null }
          { selectedTabIndex === 1 ? <EmbedOptions embedMode={config.embedMode} updateEmbedMode={updateEmbedMode} /> : null }
          { selectedTabIndex === 1 ? <JsonSpec spec={config.jsonSpec} updateJsonSpec={updateJsonSpec} /> : null }
          </div>

        </Tabs>
        <div>
          <Button className="actionButton" kind="destructive" density="high" onClick={closeSettings} name="close">Close</Button>
          <Button className="actionButton" kind="outline" density="high" onClick={resetSettings} name="reset">Reset</Button>
          <Button className="actionButton" kind="outline" density="high" onClick={saveSettings} name="apply">Apply</Button>
          <Button className="actionButton" kind="primary" density="high" onClick={saveSettings} name="save">Apply & Close</Button>
        </div>
      </div>
  );
}
