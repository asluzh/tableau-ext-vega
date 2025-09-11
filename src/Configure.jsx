import { useEffect, useState } from 'react'
import { Tabs, Button, ToggleSwitch } from '@tableau/tableau-ui';
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
    sheet: "",
    listenerFilterEvent: false,
    listenerDataChanged: true,
    listenerDashboardLayout: false,
    embedOptions: "{}",
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
      console.debug('[Configure.jsx] saved meta version', metaVersion);
      if (metaVersion > CONFIG_META_VERSION) {
        console.warn('[Configure.jsx] newer meta version detected in settings!')
        return;
      }
      if (metaVersion < CONFIG_META_VERSION) {
        console.log('[Configure.jsx] older meta version detected in saved settings, some settings may not be available');
      }
      let sheet = tableau.extensions.settings.get('sheet');
      if (sheet) {
        updateSheet(sheet);
      }
      let listenerFilterEvent = tableau.extensions.settings.get('listenerFilterEvent');
      if (listenerFilterEvent) {
        updateListenerFilterEvent(listenerFilterEvent === 'true');
      }
      let listenerDataChanged = tableau.extensions.settings.get('listenerDataChanged');
      if (listenerDataChanged) {
        updateListenerDataChanged(listenerDataChanged === 'true');
      }
      let listenerDashboardLayout = tableau.extensions.settings.get('listenerDashboardLayout');
      if (listenerDashboardLayout) {
        updateListenerDashboardLayout(listenerDashboardLayout === 'true');
      }
      let embedOptions = tableau.extensions.settings.get('embedOptions');
      if (embedOptions) {
        updateEmbedOptions(embedOptions);
      }
      let jsonSpec = tableau.extensions.settings.get('jsonSpec');
      if (jsonSpec) {
        updateJsonSpec(jsonSpec);
      }
    });
  }, []);

  function updateSheet(name) {
    // console.debug('[Configure.jsx] updateSheet', name);
    changeConfig(prevConfig => ({...prevConfig,
      sheet: name
    }));
  }

  function updateEmbedOptions(options) {
    // console.debug('[Configure.jsx] updateEmbedOptions', options);
    changeConfig(prevConfig => ({...prevConfig,
      embedOptions: options
    }));
  }

  function updateJsonSpec(spec) {
    // console.debug('[Configure.jsx] updateJsonSpec', spec);
    changeConfig(prevConfig => ({...prevConfig,
      jsonSpec: spec
    }));
  }

  function updateListenerFilterEvent(checked) {
    // console.debug('[Configure.jsx] updateListenerFilterEvent', checked);
    changeConfig(prevConfig => ({...prevConfig,
      listenerFilterEvent: checked
    }));
  }

  function updateListenerDataChanged(checked) {
    // console.debug('[Configure.jsx] updateListenerDataChanged', checked);
    changeConfig(prevConfig => ({...prevConfig,
      listenerDataChanged: checked
    }));
  }

  function updateListenerDashboardLayout(checked) {
    // console.debug('[Configure.jsx] updateListenerDashboardLayout', checked);
    changeConfig(prevConfig => ({...prevConfig,
      listenerDashboardLayout: checked
    }));
  }

  function validInputs() {
    if (!config.sheet) {
      console.warn('[Configure.jsx] sheet empty');
      return false;
    }
    try {
      JSON.parse(config.embedOptions);
    } catch (e) {
      console.warn('[Configure.jsx] invalid embedOptions', e);
      return false;
    }
    try {
      JSON.parse(config.jsonSpec);
    } catch (e) {
      console.warn('[Configure.jsx] invalid jsonSpec', e);
      return false;
    }
    return true;
  }

  function saveSettings(e) {
    console.debug('[Configure.jsx] saveSettings', e);
    if (validInputs() && tableau.extensions.environment.mode === "authoring") {
      tableau.extensions.settings.set('metaVersion', CONFIG_META_VERSION);
      // iterate through config object and save each key/value pair
      Object.entries(config).forEach(([key, value]) => {
        tableau.extensions.settings.set(key, value);
      });
      tableau.extensions.settings.saveAsync().then(() => {
        console.debug('[Configure.jsx] Settings saved');
        if (e.target.name === "save") {
          tableau.extensions.ui.closeDialog('Save and close');
        }
      },(err) => {
        window.alert('Saving settings failed! ' + err.toString());
      });
    }
  }

  function closeSettings(e) {
    console.debug('[Configure.jsx] closeSettings', e);
    tableau.extensions.ui.closeDialog('Close');
  }

  function resetSettings(e) {
    console.debug('[Configure.jsx] resetSettings', e);
    let sheet = tableau.extensions.settings.get('sheet');
    if (sheet) {
      updateSheet(sheet);
    }
    let listenerFilterEvent = tableau.extensions.settings.get('listenerFilterEvent');
    if (listenerFilterEvent) {
      updateListenerFilterEvent(listenerFilterEvent === 'true');
    }
    let listenerDataChanged = tableau.extensions.settings.get('listenerDataChanged');
    if (listenerDataChanged) {
      updateListenerDataChanged(listenerDataChanged === 'true');
    }
    let listenerDashboardLayout = tableau.extensions.settings.get('listenerDashboardLayout');
    if (listenerDashboardLayout) {
      updateListenerDashboardLayout(listenerDashboardLayout === 'true');
    }
    let embedOptions = tableau.extensions.settings.get('embedOptions');
    if (embedOptions) {
      updateEmbedOptions(embedOptions);
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
          tabs={[ { content: 'Data Input' }, { content: 'Vega Spec' }, { content: 'Embed Options' } ]}
          >
          <div className='configForm'>
          { selectedTabIndex === 0 ? <SelectSheet sheets={sheets} sheet={config.sheet} updateSheet={updateSheet} /> : null }
          { selectedTabIndex === 0 ? <div style={{ width: 250, paddingTop: 10 }}><ToggleSwitch textAlign="left" checked={config.listenerFilterEvent} onChange={e => updateListenerFilterEvent(e.target.checked)}>FilterChanged Listener</ToggleSwitch></div> : null }
          { selectedTabIndex === 0 ? <div style={{ width: 250, paddingTop: 10 }}><ToggleSwitch textAlign="left" checked={config.listenerDataChanged} onChange={e => updateListenerDataChanged(e.target.checked)}>SummaryDataChanged Listener</ToggleSwitch></div> : null }
          { selectedTabIndex === 0 ? <div style={{ width: 250, paddingTop: 10 }}><ToggleSwitch textAlign="left" checked={config.listenerDashboardLayout} onChange={e => updateListenerDashboardLayout(e.target.checked)}>DashboardLayoutChanged Listener</ToggleSwitch></div> : null }
          { selectedTabIndex === 1 ? <JsonSpec spec={config.jsonSpec} updateJsonSpec={updateJsonSpec} /> : null }
          { selectedTabIndex === 2 ? <EmbedOptions options={config.embedOptions} updateEmbedOptions={updateEmbedOptions} /> : null }
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
