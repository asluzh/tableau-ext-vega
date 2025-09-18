import { useEffect, useState, useRef } from 'react'
import embed from 'vega-embed'
import JSON5 from 'json5'
import packageJson from '../package.json'
import logger from './utils/logger.js'
import './Extension.css'

/* Declare this so our linter knows that tableau is a global object
global tableau
import "../../../public/lib/tableau.extensions.1.latest.min.js?raw";
*/

function configure() {
  logger.debug('Opening configure popup');
  const popupUrl = `${window.location.origin}${import.meta.env.BASE_URL}configure.html`;
  tableau.extensions.ui.displayDialogAsync(popupUrl, null, { height: 600, width: 600 })
  .then((payload) => {
    logger.debug('displayDialogAsync was closed with payload:', payload);
  })
  .catch((error) => {
    switch(error.errorCode) {
      case tableau.ErrorCodes.DialogClosedByUser:
        logger.debug('Dialog was closed by user');
        break;
      default:
        logger.error(error.message);
    }
  });
}

export default function Extension() {
  const ref = useRef(null);
  const vegaEmbed = useRef(null);
  const [data, setData] = useState([]);
  const [embedOptions, setEmbedOptions] = useState(null);
  const [jsonSpec, setJsonSpec] = useState(null);


  useEffect(() => {

    let listenerDataChanged = "";
    let unregisterDataChangedListener = null;
    let unregisterSettingsChangedListener = null;
    let cancel = false;

    const updateData = async (worksheet) => {
      logger.debug('updateData from', worksheet.name);
      if (cancel) {
        logger.debug('updateData cancelled');
        return;
      }
      try {
        const dataTableReader = await worksheet.getSummaryDataReaderAsync(undefined, {
          // applyWorksheetFormatting: true,
          // ignoreAliases: true,
          ignoreSelection: true,
          // includeDataValuesOption: tableau.IncludeDataValuesOption.AllValues, // AllValues, OnlyFormattedValues, OnlyNativeValues
          // maxRows: 0, // 0 means no limit
        });
        logger.debug('Data reader row count:', dataTableReader.totalRowCount);
        if (dataTableReader.pageCount > 0) {
          try {
            const dataTable = await dataTableReader.getAllPagesAsync();
            // logger.debug('getAllPagesAsync dataTable:', dataTable);
            const columns = dataTable.columns.map(col => col.fieldName);
            logger.debug('Worksheet columns:', columns);
            const data = dataTable.data.map(row => {
              const obj = {};
              row.forEach((cell, idx) => {
                obj[columns[idx]] = cell.value;
              });
              return obj;
            });
            // logger.debug('getAllPagesAsync processed data:', data);
            setData(data);
          } catch (err) {
            logger.error('getAllPagesAsync failed:', err.toString());
            setData([]);
          } finally {
            await dataTableReader.releaseAsync();
          }
        } else {
          logger.log('Empty data in worksheet:', worksheet.name);
          setData([]);
        }
      } catch (err) {
        logger.error('getSummaryDataReaderAsync failed:', err.toString());
        setData([]);
      } finally {
        if (!unregisterDataChangedListener) {
          switch (listenerDataChanged) {
          case 'SummaryDataChanged':
            logger.debug('Adding SummaryDataChanged event listener');
            unregisterDataChangedListener = worksheet.addEventListener(tableau.TableauEventType.SummaryDataChanged, () => {
              logger.debug('SummaryDataChanged event');
              updateData(worksheet);
            });
            break;
          case 'FilterChanged':
            logger.debug('Adding FilterChanged event listener');
            unregisterDataChangedListener = worksheet.addEventListener(tableau.TableauEventType.FilterChanged, () => {
              logger.debug('FilterChanged event');
              updateData(worksheet);
            });
            break;
          }
        }
      }
    };

    const updateSettings = async () => {
      if (unregisterDataChangedListener) {
        logger.debug(`Removing ${listenerDataChanged} event listener`);
        unregisterDataChangedListener();
        unregisterDataChangedListener = null;
      }
      const sheet = tableau.extensions.settings.get('sheet');
      logger.debug('Data sheet', sheet);
      const jsonSpecText = tableau.extensions.settings.get('jsonSpec').replace(/(\r|\n)/g,'');
      setJsonSpec(JSON5.parse(jsonSpecText));
      const embedOptionsText = tableau.extensions.settings.get('embedOptions').replace(/(\r|\n)/g,'');
      setEmbedOptions(JSON5.parse(embedOptionsText));
      listenerDataChanged = tableau.extensions.settings.get('listenerDataChanged');
      ref.current.style = tableau.extensions.settings.get('mainDivStyle');
      // logger.debug('Ref style:', ref.current.style);
      // width: 100vw; height: calc(100vh - 4px); border: 1px dashed lightgray;
      if (sheet) {
        const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
        const worksheet = worksheets.find(s => s.name == sheet);
        // logger.debug('Worksheets', worksheets);
        if (!worksheet) {
          logger.warn('Worksheet not found:', sheet);
          setData([]);
          return;
        }
        updateData(worksheet);
      }
    };

    logger.debug('useEffect');
    tableau.extensions.initializeAsync({'configure': configure}).then(() => {
      logger.debug('initializeAsync completed, Tableau environment:', tableau.extensions.environment.tableauVersion);
      updateSettings();
      unregisterSettingsChangedListener = tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (e) => {
        logger.debug('Settings changed:', e);
        updateSettings();
      });
    }, (err) => {
      logger.error('initializeAsync failed:', err.toString());
    });
    logger.log('Running', packageJson.name, packageJson.version);
    return () => {
      cancel = true;
      logger.debug('useEffect unmount');
      if (unregisterSettingsChangedListener) {
        unregisterSettingsChangedListener();
        unregisterSettingsChangedListener = null;
        logger.debug('Removed SettingsChanged event listener');
      }
      if (unregisterDataChangedListener) {
        logger.debug(`Removing ${listenerDataChanged} event listener`);
        unregisterDataChangedListener();
        unregisterDataChangedListener = null;
      }
      vegaEmbed.current?.finalize();
    };
  }, []);

  useEffect(() => {
    logger.debug('useEffect data update');
    // TODO add option to show banner text when empty data, instead of blank chart
    if (data) {
      if (!vegaEmbed.current) {
        logger.debug('No embed instance yet');
      } else {
        vegaEmbed.current.view.data("vizdata", data).runAsync();
      }
    }
  }, [vegaEmbed, data]);

  useEffect(() => {
    logger.debug('useEffect embed settings update');
    const createView = async () => {
      if (ref.current && embedOptions && jsonSpec) {
        try {
          if (vegaEmbed.current) {
            if (JSON5.stringify(vegaEmbed.current.spec) !== JSON5.stringify(jsonSpec)) {
              logger.debug('New spec received, re-embedding');
              await vegaEmbed.current.finalize();
              vegaEmbed.current = await embed(ref.current, jsonSpec, embedOptions);
            }
            if (JSON5.stringify(vegaEmbed.current.embedOptions) !== JSON5.stringify(embedOptions)) {
              logger.debug('New options received, re-embedding');
              await vegaEmbed.current.finalize();
              vegaEmbed.current = await embed(ref.current, jsonSpec, embedOptions);
            }
          } else if (!vegaEmbed.current) {
            logger.debug('Initial embedding');
            vegaEmbed.current = await embed(ref.current, jsonSpec, embedOptions);
            // TODO handle WARN Infinite extent for field "x": [Infinity, -Infinity]
          }
        } catch (err) {
          logger.error('Error creating view:', err.toString());
        }
      }
    };
    createView();
  }, [vegaEmbed, embedOptions, jsonSpec]);

  return (
    <div ref={ref} />
  )
}
