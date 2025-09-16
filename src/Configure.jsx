import { useEffect, useState } from 'react'
import { Tabs, Button, ToggleSwitch } from '@tableau/tableau-ui'
import SelectSheet from './components/SelectSheet'
import JsonSpec from './components/JsonSpec'
import EmbedOptions from './components/EmbedOptions'
import StylingOptions from './components/StylingOptions'
import JSON5 from 'json5'
import logger from './utils/logger.js'
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
    embedOptions: '{}',
    jsonSpec: '{ "actions": false, "config": {} }',
    mainDivStyle: 'width: 100vw; height: 100vh;',
  });
  // const maxSpecLength = 10000; // total workbook length limit is 2MB, so the character limit is rarely a problem

  useEffect(() => {
    logger.debug('useEffect');
    //Initialise Extension
    tableau.extensions.initializeDialogAsync().then((openPayload) => {
      logger.debug('Initialize Dialog', openPayload);
      setSheets(tableau.extensions.dashboardContent.dashboard.worksheets);
      let metaVersion = parseInt(tableau.extensions.settings.get('metaVersion'));
      logger.debug('Ssaved meta version', metaVersion);
      if (metaVersion > CONFIG_META_VERSION) {
        logger.warn('Newer meta version detected in settings!')
        return;
      }
      if (metaVersion < CONFIG_META_VERSION) {
        logger.log('Older meta version detected in saved settings, some settings may not be available');
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
      let mainDivStyle = tableau.extensions.settings.get('mainDivStyle');
      if (mainDivStyle) {
        updateStylingOptions({mainDivStyle: mainDivStyle});
      }
    });
  }, []);

  function updateSheet(name) {
    logger.debug('updateSheet', name);
    changeConfig(prevConfig => ({...prevConfig,
      sheet: name
    }));
  }

  function updateEmbedOptions(options) {
    logger.debug('updateEmbedOptions', options);
    changeConfig(prevConfig => ({...prevConfig,
      embedOptions: options
    }));
  }

  function updateJsonSpec(spec) {
    logger.debug('updateJsonSpec', spec);
    changeConfig(prevConfig => ({...prevConfig,
      jsonSpec: spec
    }));
  }

  function updateListenerFilterEvent(checked) {
    logger.debug('updateListenerFilterEvent', checked);
    changeConfig(prevConfig => ({...prevConfig,
      listenerFilterEvent: checked
    }));
  }

  function updateListenerDataChanged(checked) {
    logger.debug('updateListenerDataChanged', checked);
    changeConfig(prevConfig => ({...prevConfig,
      listenerDataChanged: checked
    }));
  }

  function updateListenerDashboardLayout(checked) {
    logger.debug('updateListenerDashboardLayout', checked);
    changeConfig(prevConfig => ({...prevConfig,
      listenerDashboardLayout: checked
    }));
  }

  function updateStylingOptions(styles) {
    logger.debug('updateStylingOptions', styles);
    changeConfig(prevConfig => ({...prevConfig,
      mainDivStyle: styles.mainDivStyle
    }));
  }

  function validInputs() {
    if (!config.sheet) {
      logger.warn('Sheet variable is empty');
      return false;
    }
    try {
      JSON5.parse(config.embedOptions);
    } catch (e) {
      logger.warn('Invalid embedOptions', e);
      return false;
    }
    try {
      JSON5.parse(config.jsonSpec);
    } catch (e) {
      logger.warn('Invalid jsonSpec', e);
      return false;
    }
    return true;
  }

  function saveSettings(e) {
    logger.debug('saveSettings', e);
    if (validInputs() && tableau.extensions.environment.mode === "authoring") {
      tableau.extensions.settings.set('metaVersion', CONFIG_META_VERSION);
      // iterate through config object and save each key/value pair
      Object.entries(config).forEach(([key, value]) => {
        tableau.extensions.settings.set(key, value);
      });
      tableau.extensions.settings.saveAsync().then(() => {
        logger.debug('Settings saved');
        if (e.target.name === "save") {
          tableau.extensions.ui.closeDialog('Save and close');
        }
      },(err) => {
        window.alert('Saving settings failed! ' + err.toString());
      });
    }
  }

  function closeSettings(e) {
    logger.debug('closeSettings', e);
    tableau.extensions.ui.closeDialog('Close');
  }

  function resetSettings(e) {
    logger.debug('resetSettings', e);
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
          tabs={[ { content: 'Data Input' }, { content: 'Vega Spec' }, { content: 'Embed Options' }, { content: 'Styling' } ]}
          >
          <div className='configForm'>
          { selectedTabIndex === 0 ? <SelectSheet sheets={sheets} sheet={config.sheet} updateSheet={updateSheet} /> : null }
          { selectedTabIndex === 0 ? <div style={{ width: 250, paddingTop: 10 }}><ToggleSwitch textAlign="left" checked={config.listenerFilterEvent} onChange={e => updateListenerFilterEvent(e.target.checked)}>FilterChanged Listener</ToggleSwitch></div> : null }
          { selectedTabIndex === 0 ? <div style={{ width: 250, paddingTop: 10 }}><ToggleSwitch textAlign="left" checked={config.listenerDataChanged} onChange={e => updateListenerDataChanged(e.target.checked)}>SummaryDataChanged Listener</ToggleSwitch></div> : null }
          { selectedTabIndex === 0 ? <div style={{ width: 250, paddingTop: 10 }}><ToggleSwitch textAlign="left" checked={config.listenerDashboardLayout} onChange={e => updateListenerDashboardLayout(e.target.checked)}>DashboardLayoutChanged Listener</ToggleSwitch></div> : null }
          { selectedTabIndex === 1 ? <JsonSpec spec={config.jsonSpec} updateJsonSpec={updateJsonSpec} /> : null }
          { selectedTabIndex === 2 ? <EmbedOptions options={config.embedOptions} updateEmbedOptions={updateEmbedOptions} /> : null }
          { selectedTabIndex === 3 ? <StylingOptions mainDivStyle={config.mainDivStyle} updateStylingOptions={updateStylingOptions} /> : null }
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
