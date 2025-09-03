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
    const updateSettings = async () => {
      let selectedSheet = tableau.extensions.settings.get('selectedSheet');
      console.debug('[Extension.jsx] selectedSheet', selectedSheet);
      setEmbedMode(tableau.extensions.settings.get('embedMode'));
      setJsonSpec(JSON.parse(tableau.extensions.settings.get('jsonSpec')));
      if (selectedSheet) {
        const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
        const worksheet = worksheets.find(sheet => sheet.name == selectedSheet);
        console.debug('[Extension.jsx] worksheets', worksheets);
        if (!worksheet) {
          console.warn('[Extension.jsx] Worksheet not found:', selectedSheet);
          // setData([]);
          return;
        }
        const dataTableReader = await worksheet.getSummaryDataReaderAsync();
        try {
          const dataTable = await dataTableReader.getAllPagesAsync();
          console.debug('[Extension.jsx] getAllPagesAsync dataTable:', dataTable);
          // setData(dataTable.data);
          setData([
              { "i-type": "A", "count": 3, "color": "rgb(121, 199, 227)" },
              { "i-type": "B", "count": 20, "color": "rgb(26, 49, 119)" },
              { "i-type": "C", "count": 24, "color": "rgb(18, 147, 154)" },
              { "i-type": "D", "count": 6, "color": "rgba(154, 18, 18, 1)" },
            ]);
        } catch (err) {
          console.error('[Extension.jsx] getAllPagesAsync failed:', err.toString());
          // setData([]);
        } finally {
          await dataTableReader.releaseAsync();
        }
      }
    }
    console.debug('[Extension.jsx] useEffect');
    let unregisterSettingsEventListener = null;
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
              console.debug('[Extension.jsx] old spec', vegaEmbed.current.spec);
              console.debug('[Extension.jsx] new spec', jsonSpec);
              console.debug('[Extension.jsx] old mode', vegaEmbed.current.embedOptions.mode);
              console.debug('[Extension.jsx] new mode', embedMode);
              await vegaEmbed.current.finalize();
              vegaEmbed.current = await embed(ref.current, jsonSpec, { mode: embedMode });
            }
          } else if (!vegaEmbed.current) {
            vegaEmbed.current = await embed(ref.current, jsonSpec, { mode: embedMode });
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
