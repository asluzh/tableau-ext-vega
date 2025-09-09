import { useEffect, useState, useRef } from 'react'
import embed from 'vega-embed';
import './Extension.css'

// Declare this so our linter knows that tableau is a global object
/* global tableau */

function configure() {
  console.debug('[Extension.jsx] Opening configure popup');
  const popupUrl = `${window.location.origin}${import.meta.env.BASE_URL}configure.html`;
  tableau.extensions.ui.displayDialogAsync(popupUrl, null, { height: 600, width: 600 })
  .then((closePayload) => {
    console.debug('[Extension.jsx] displayDialogAsync was closed with payload:', closePayload);
  })
  .catch((error) => {
    switch(error.errorCode) {
      case tableau.ErrorCodes.DialogClosedByUser:
        console.debug('[Extension.jsx] Dialog was closed by user');
        break;
      default:
        console.error('[Extension.jsx]', error.message);
    }
  });
}

export default function Extension() {
  const ref = useRef(null);
  const vegaEmbed = useRef(null);
  const [data, setData] = useState([]);
  const [embedMode, setEmbedMode] = useState(null);
  const [jsonSpec, setJsonSpec] = useState(null);

  // TODO useEffect is called twice, because of React.StrictMode?
  useEffect(() => {
    let unregisterFilterEventListener = null;
    let unregisterDataChangedListener = null;
    const renderViz = async (worksheet) => {
      console.debug('[Extension.jsx] renderViz', worksheet.name);
      if (unregisterFilterEventListener) {
        unregisterFilterEventListener();
        unregisterFilterEventListener = null;
      }
      if (unregisterDataChangedListener) {
        unregisterDataChangedListener();
        unregisterDataChangedListener = null;
      }
      // TODO make event subscription via config options
      const dataTableReader = await worksheet.getSummaryDataReaderAsync();
      // console.debug('[Extension.jsx] getSummaryDataReaderAsync', dataTableReader);
      if (dataTableReader.pageCount > 0) {
        try {
          const dataTable = await dataTableReader.getAllPagesAsync();
          // console.debug('[Extension.jsx] getAllPagesAsync dataTable:', dataTable);
          const columns = dataTable.columns.map(col => col.fieldName);
          const data = dataTable.data.map(row => {
            const obj = {};
            row.forEach((cell, idx) => {
              obj[columns[idx]] = cell.value;
            });
            return obj;
          });
          // console.debug('[Extension.jsx] getAllPagesAsync processed data:', data);
          setData(data);
        } catch (err) {
          console.error('[Extension.jsx] getAllPagesAsync failed:', err.toString());
          setData([]);
        } finally {
          await dataTableReader.releaseAsync();
        }
        unregisterFilterEventListener = worksheet.addEventListener(tableau.TableauEventType.FilterChanged, () => {
          console.debug('[Extension.jsx] FilterChanged event');
          renderViz(worksheet);
        });
        unregisterDataChangedListener = worksheet.addEventListener(tableau.TableauEventType.SummaryDataChanged, () => {
          console.debug('[Extension.jsx] SummaryDataChanged event');
          renderViz(worksheet);
        });
      } else {
        console.log('[Extension.jsx] Empty data in worksheet:', worksheet.name);
        setData([]);
      }
    };
    const updateSettings = async () => {
      let selectedSheet = tableau.extensions.settings.get('selectedSheet');
      console.debug('[Extension.jsx] selectedSheet', selectedSheet);
      setEmbedMode(tableau.extensions.settings.get('embedMode'));
      setJsonSpec(JSON.parse(tableau.extensions.settings.get('jsonSpec')));
      if (selectedSheet) {
        const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
        const worksheet = worksheets.find(sheet => sheet.name == selectedSheet);
        // console.debug('[Extension.jsx] worksheets', worksheets);
        if (!worksheet) {
          console.warn('[Extension.jsx] Worksheet not found:', selectedSheet);
          setData([]);
          return;
        }
        renderViz(worksheet);
      }
    }
    console.debug('[Extension.jsx] useEffect');
    let unregisterSettingsEventListener = null;
    // TODO tableau is not defined, because the script is not loaded yet?
    tableau.extensions.initializeAsync({'configure': configure}).then(() => {
      console.debug('[Extension.jsx] initializeAsync completed');
      updateSettings();
      unregisterSettingsEventListener = tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent) => {
        console.debug('[Extension.jsx] Settings changed:', settingsEvent);
        updateSettings();
      });
    }, (err) => {
      console.error('[Extension.jsx] initializeAsync failed:', err.toString());
    });
    return () => {
      console.debug('[Extension.jsx] useEffect unmount');
      if (unregisterSettingsEventListener) {
        unregisterSettingsEventListener();
        unregisterSettingsEventListener = null;
      }
      if (unregisterFilterEventListener) {
        unregisterFilterEventListener();
        unregisterFilterEventListener = null;
      }
      if (unregisterDataChangedListener) {
        unregisterDataChangedListener();
        unregisterDataChangedListener = null;
      }
      vegaEmbed.current?.finalize();
    };
  }, []);

  useEffect(() => {
    console.debug('[Extension.jsx] useEffect data update');
    if (data && data.length > 0) {
      vegaEmbed.current?.view.data("vizdata", data).runAsync();
    }
  }, [vegaEmbed, data]);

  useEffect(() => {
    console.debug('[Extension.jsx] useEffect embed settings update');
    const createView = async () => {
      if (ref.current && embedMode && jsonSpec) {
        try {
          if (vegaEmbed.current) {
            if (JSON.stringify(vegaEmbed.current.spec) !== JSON.stringify(jsonSpec) || vegaEmbed.current.embedOptions.mode !== embedMode) {
              // console.debug('[Extension.jsx] old spec', vegaEmbed.current.spec);
              // console.debug('[Extension.jsx] new spec', jsonSpec);
              // console.debug('[Extension.jsx] old mode', vegaEmbed.current.embedOptions.mode);
              // console.debug('[Extension.jsx] new mode', embedMode);
              await vegaEmbed.current.finalize();
              vegaEmbed.current = await embed(ref.current, jsonSpec, { mode: embedMode });
            }
          } else if (!vegaEmbed.current) {
            vegaEmbed.current = await embed(ref.current, jsonSpec, { mode: embedMode });
            // TODO handle WARN Infinite extent for field "x": [Infinity, -Infinity]
          }
        } catch (err) {
          console.error('[Extension.jsx] Error creating view:', err.toString());
        }
      }
    };
    createView();
  }, [vegaEmbed, embedMode, jsonSpec]);

  return (
    <div ref={ref} />
  )
}
