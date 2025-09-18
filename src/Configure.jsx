import { useEffect, useState } from 'react'
import { Tabs, Button, DropdownSelect } from '@tableau/tableau-ui'
import SelectSheet from './components/SelectSheet'
import JsonSpec from './components/JsonSpec'
import EmbedOptions from './components/EmbedOptions'
import StylingOptions from './components/StylingOptions'
import JSON5 from 'json5'
import logger from './utils/logger.js'
import './Configure.css'

/* Declare this so our linter knows that tableau is a global object
global tableau
import "../../../public/lib/tableau.extensions.1.latest.min.js?raw";
*/

const CONFIG_META_VERSION = 1;
const DEFAULT_CONFIG = {
  sheet: "",
  listenerDataChanged: "",
  jsonSpec: '{}',
  embedOptions: '{ "actions": false, "config": {} }',
  mainDivStyle: 'width: 100vw; height: 100vh;',
};

export default function Configure() {
  const [tabIndex, setTabIndex] = useState(0);
  const [sheets, setSheets] = useState([]);
  const [enableSave, setEnableSave] = useState(true);
  const [summaryDataChangedAvailable, setSummaryDataChangedAvailable] = useState(false);
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    logger.debug('useEffect');
    tableau.extensions.initializeDialogAsync().then((payload) => {
      logger.debug('initializeDialogAsync completed', payload);
      logger.debug('Tableau environment:', tableau.extensions.environment.tableauVersion);
      setSummaryDataChangedAvailable(tableau.extensions.environment.tableauVersion && tableau.extensions.environment.tableauVersion >= "2024");
      setSheets(tableau.extensions.dashboardContent.dashboard.worksheets);
      const allSettings = tableau.extensions.settings.getAll();
      if (Object.keys(allSettings).length > 0) {
        logger.log("Existing settings found:", allSettings);
        try {
          if ("metaVersion" in allSettings && parseInt(allSettings.metaVersion)) {
            let metaVersion = parseInt(tableau.extensions.settings.get('metaVersion'));
            if (metaVersion > CONFIG_META_VERSION) {
              logger.warn('Newer meta version detected in settings!')
              return;
            }
            if (metaVersion < CONFIG_META_VERSION) {
              logger.log('Older meta version detected in saved settings, some settings may not be available');
            }
            const parsedConfig = {...DEFAULT_CONFIG}; // create a shallow copy
            Object.entries(allSettings).forEach(([key, value]) => {
              if (key in parsedConfig) {
                parsedConfig[key] = value;
              }
            });
            setConfig(parsedConfig);
          }
        } catch (e) {
          logger.error("Error updating settings:", e);
        }
      } else {
        setConfig(DEFAULT_CONFIG);
      }
    });
    return () => {
      logger.debug('useEffect unmount');
    }
  }, []);

  function updateSheet(name) {
    logger.debug('updateSheet', name);
    setConfig(prev => ({...prev,
      sheet: name
    }));
  }

  function updateEmbedOptions(options) {
    logger.debug('updateEmbedOptions', options);
    setConfig(prev => ({...prev,
      embedOptions: options
    }));
  }

  function updateJsonSpec(spec) {
    logger.debug('updateJsonSpec', spec);
    setConfig(prev => ({...prev,
      jsonSpec: spec
    }));
  }

  function updateStylingOptions(styles) {
    logger.debug('updateStylingOptions', styles);
    setConfig(prev => ({...prev,
      mainDivStyle: styles.mainDivStyle
    }));
  }

  function validInputs() {
    if (!config.sheet) {
      logger.warn('Sheet variable is empty');
      return false;
    }
    try {
      JSON5.parse(config.embedOptions.replace(/(\r|\n)/g,''));
    } catch (e) {
      logger.warn('Invalid embedOptions', e);
      return false;
    }
    try {
      JSON5.parse(config.jsonSpec.replace(/(\r|\n)/g,''));
    } catch (e) {
      logger.warn('Invalid jsonSpec', e);
      return false;
    }
    return true;
  }

  function saveSettings(e) {
    // logger.debug('saveSettings', e);
    if (validInputs() && tableau.extensions.environment.mode === "authoring") {
      setEnableSave(false);
      tableau.extensions.settings.set('metaVersion', CONFIG_META_VERSION);
      // iterate through config object and save each key/value pair
      Object.entries(config).forEach(([key, value]) => {
        logger.debug("Setting", key, "=", config[key]);
        tableau.extensions.settings.set(key, value);
      });
      tableau.extensions.settings.saveAsync().then(() => {
        logger.debug('Settings saved');
        if (e.target.name === "save") {
          tableau.extensions.ui.closeDialog('save and close');
        } else {
          setEnableSave(true);
        }
      },(err) => {
        window.alert('Saving settings failed! ' + err.toString());
      });
    }
  }

  function closeSettings(e) {
    // logger.debug('Close configure dialog', e);
    tableau.extensions.ui.closeDialog('close');
  }

  function resetSettings(e) {
    // logger.debug('Reset settings', e);
    setConfig(DEFAULT_CONFIG);
    setTabIndex(0);
  }

  return (
    <div>
      <Tabs
        activation='automatic'
        alignment='left'
        onTabChange={setTabIndex}
        selectedTabIndex={tabIndex}
        tabs={[
          { content: 'Data' },
          { content: 'Vega Spec' },
          { content: 'Embed Options' },
          { content: 'Styling' },
        ]}
      >
        <div className='configForm'>
          {tabIndex === 0 && (
            <SelectSheet sheets={sheets} sheet={config.sheet} updateSheet={updateSheet} />
          )}
          {tabIndex === 0 && (
            <div style={{ marginTop: 20, marginBottom: 20 }}>
              <DropdownSelect
                kind='line'
                label="Data Change Event Listener"
                value={config.listenerDataChanged}
                onChange={e => { setConfig(prev => ({...prev, listenerDataChanged: e.target.value })); }}
              >
                <option key="" value="">None</option>
                <option key="FilterChanged" value="FilterChanged">Filter Changed</option>
                <option key="SummaryDataChanged" value="SummaryDataChanged" disabled={!summaryDataChangedAvailable}>Summary Data Changed</option>
              </DropdownSelect>
            </div>
          )}
          {tabIndex === 1 && (
            <JsonSpec spec={config.jsonSpec} updateJsonSpec={updateJsonSpec} />
          )}
          {tabIndex === 2 && (
            <EmbedOptions options={config.embedOptions} updateEmbedOptions={updateEmbedOptions} />
          )}
          {tabIndex === 3 && (
            <StylingOptions mainDivStyle={config.mainDivStyle} updateStylingOptions={updateStylingOptions} />
          )}
        </div>
      </Tabs>
      <div
        style={{
          bottom: 20,
          right: 20,
          position: 'fixed'
        }}
      >
        <Button
          className="actionButton"
          kind="destructive"
          density="high"
          onClick={closeSettings}
          name="close"
        >Close</Button>
        <Button
          className="actionButton"
          kind="outline"
          density="high"
          onClick={resetSettings}
          name="reset"
        >Reset</Button>
        <Button
          className="actionButton"
          kind="outline"
          density="high"
          disabled={!enableSave}
          onClick={saveSettings}
          name="apply"
          >Apply</Button>
        <Button
          className="actionButton"
          kind="primary"
          density="high"
          disabled={!enableSave}
          onClick={saveSettings}
          name="save"
          >Apply & Close</Button>
      </div>
    </div>
  );
}
