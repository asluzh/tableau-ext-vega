import { useEffect, useState } from 'react'
import { Tabs, Button, DropdownSelect } from '@tableau/tableau-ui'
import JSON5 from 'json5'
import SelectSheet from './components/SelectSheet'
import JsonSpec from './components/JsonSpec'
import EmbedOptions from './components/EmbedOptions'
import StylingOptions from './components/StylingOptions'
import { loadConfig, saveConfig, defaultConfig } from './utils/settings.js'
import logger from './utils/logger.js'
import './Configure.css'

/* Declare this so our linter knows that tableau is a global object
global tableau
import "../../../public/lib/tableau.extensions.1.latest.min.js?raw";
*/

export default function Configure() {
  const [tabIndex, setTabIndex] = useState(0);
  const [sheets, setSheets] = useState([]);
  const [enableSave, setEnableSave] = useState(true);
  const [summaryDataChangedAvailable, setSummaryDataChangedAvailable] = useState(false);
  const [config, setConfig] = useState(defaultConfig());

  useEffect(() => {
    logger.debug('useEffect');
    tableau.extensions.initializeDialogAsync().then((payload) => {
      logger.debug('initializeDialogAsync completed', payload);
      logger.debug('Tableau environment:', tableau.extensions.environment.tableauVersion);
      setSummaryDataChangedAvailable(tableau.extensions.environment.tableauVersion && tableau.extensions.environment.tableauVersion >= "2024");
      setSheets(tableau.extensions.dashboardContent.dashboard.worksheets);
      setConfig(loadConfig());
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
      saveConfig(config).then((newSettings) => {
        logger.debug('Settings saved:', newSettings);
        if (e.target.name === "save") {
          tableau.extensions.ui.closeDialog('save and close');
        } else {
          setEnableSave(true);
        }
      }).catch((err) => {
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
    setConfig(defaultConfig());
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
