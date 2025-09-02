import { useEffect, useState } from 'react'
import embed from 'vega-embed';
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

function update() {
  let selectedSheet = tableau.extensions.settings.get('selectedSheet');
  let embedMode = tableau.extensions.settings.get('embedMode');
  let jsonSpec = tableau.extensions.settings.get('jsonSpec');
  console.debug('[Extension.jsx] refreshSettings selectedSheet:', selectedSheet);
  console.debug('[Extension.jsx] refreshSettings embedMode:', embedMode);
  console.debug('[Extension.jsx] refreshSettings jsonSpec:', jsonSpec);
}

export default function Extension() {
  const [data, setData] = useState([]);

  // TODO useEffect is called twice, because of React.StrictMode?
  useEffect(() => {
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
    let timer1 = setTimeout(() => {
      console.debug('[Extension.jsx] setting data');
      setData([
          { "i-type": "A", "count": 3, "color": "rgb(121, 199, 227)" },
          { "i-type": "B", "count": 20, "color": "rgb(26, 49, 119)" },
          { "i-type": "C", "count": 24, "color": "rgb(18, 147, 154)" },
          { "i-type": "D", "count": 6, "color": "rgba(154, 18, 18, 1)" },
        ]);
      }, 1000);
    return () => {
      if (unregisterSettingsEventListener) {
        unregisterSettingsEventListener();
        unregisterSettingsEventListener = null;
      }
      if (timer1) {
        clearTimeout(timer1);
      }
    };
  }, []);

  useEffect(() => {
    console.debug('[Extension.jsx] useEffect data.length changed:', data.length);
    let spec = {
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
    };
    embed("#viz", spec).then(results => {
      results.view.insert("vizdata", data).run();
      // results.view.width(
      //   document.getElementById("bubble_chart").offsetWidth - 100
      // );
      // results.view.height(
      //   document.getElementById("bubble_chart").offsetHeight - 10
      // );

      // window.onresize = function(event) {
      //   results.view.width(
      //     document.getElementById("bubble_chart").offsetWidth - 100
      //   );
      //   results.view.run();
      // };
    });
  }, [data]);

  return (
    <div id="viz" />
  )
}
