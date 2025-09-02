import { useEffect, useState, useRef } from 'react'
import { useVegaEmbed } from 'react-vega';
import './Extension.css'

// Declare this so our linter knows that tableau is a global object
/* global tableau */

function configure() {
  console.debug('[Extension.jsx] Opening configure popup');
  const popupUrl = `${window.location.origin}${import.meta.env.BASE_URL}configure.html`;
  tableau.extensions.ui.displayDialogAsync(popupUrl, null, { height: 500, width: 500 })
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
  const [data, setData] = useState([]);
  const ref = useRef(null);
  const embed = useVegaEmbed({
    ref,
    spec: {
      $schema: "https://vega.github.io/schema/vega-lite/v6.json",
      data: {
        name: "vizdata"
      },
      description: "A simple pie chart with labels.",
      encoding: {
        theta: { field: "count", type: "quantitative", stack: true },
        color: { field: "color", type: "nominal", legend: null, scale: null }
      },
      layer: [
        {
          mark: { type: "arc", outerRadius: 80 }
        }
      ]
    },
    // options: {},
  });
  const [embedMode, setEmbedMode] = useState();
  const [jsonSpec, setJsonSpec] = useState();

  // TODO useEffect is called twice, because of React.StrictMode?
  useEffect(() => {
    async function update() {
      let selectedSheet = tableau.extensions.settings.get('selectedSheet');
      setEmbedMode(tableau.extensions.settings.get('embedMode'));
      setJsonSpec(tableau.extensions.settings.get('jsonSpec'));
      console.debug('[Extension.jsx] selectedSheet', selectedSheet);
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
              { "i-type": "B", "count": 20, "colo¬r": "rgb(26, 49, 119)" },
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
      update();
      unregisterSettingsEventListener = tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, function (settingsEvent) {
        console.debug('[Extension.jsx] Settings changed:', settingsEvent);
        update();
      });
    }, (err) => {
      console.error('[Extension.jsx] initializeAsync failed:', err.toString());
    });
    return () => {
      if (unregisterSettingsEventListener) {
        unregisterSettingsEventListener();
        unregisterSettingsEventListener = null;
      }
    };
  }, []);

  useEffect(() => {
    console.debug('[Extension.jsx] useEffect embed data update');
    console.debug('[Extension.jsx] data', data);
    console.debug('[Extension.jsx] embed', embed);
    if (embed && data && data.length > 0) {
      embed.view.data("vizdata", data).runAsync();
    }
  }, [embed, data]);

  useEffect(() => {
    console.debug('[Extension.jsx] useEffect embed settings update');
    console.debug('[Extension.jsx] embedMode', embedMode);
    console.debug('[Extension.jsx] jsonSpec', jsonSpec);
    console.debug('[Extension.jsx] embed', embed);
    if (embed && embedMode && jsonSpec) {
      // embed.finalize();
      embed.spec = jsonSpec;
      embed.options = { mode: embedMode };
      embed.view.runAsync();
    }
  }, [embed, embedMode, jsonSpec]);

  return (
    <div ref={ref} />
  )
}
