import { useEffect } from 'react'
import { createClassFromSpec } from "react-vega";
import './Extension.css'

// Declare this so our linter knows that tableau is a global object
/* global tableau */

export default function App(props) {
  // TODO useEffect is called twice, because of React.StrictMode?
  useEffect(() => {
    console.debug('[Extension.jsx] useEffect props changed', props);
  }, [props]);

  useEffect(() => {
    console.debug('[Extension.jsx] useEffect');
    console.log(tableau);
    //Initialise Extension
    tableau.extensions.initializeAsync({'configure': configure}).then(() => {
      console.debug('[Extension.jsx] initializeAsync completed');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function configure () {
    console.debug('[Extension.jsx] Opening configure popup');
    const popupUrl = `${window.location.origin}/configure`;
    tableau.extensions.ui.displayDialogAsync(popupUrl, null, { height: 500, width: 500 }).then((closePayload) => {
      console.debug('[Extension.jsx] displayDialogAsync was closed with payload:', closePayload);
      // refreshSettings();
      console.debug('[Extension.jsx] Config window closed', props)
    }).catch((error) => {
      switch(error.errorCode) {
        case tableau.ErrorCodes.DialogClosedByUser:
          console.debug('[Extension.jsx] Dialog was closed by user');
          // refreshSettings();
          break;
        default:
          console.error('[Extension.jsx]', error.message);
      }
    });
  }

  const VegaChart = createClassFromSpec({
    spec: {
      $schema: "https://vega.github.io/schema/vega-lite/v6.json",
      data: {
        values: [
          {
            "i-type": "A",
            count: 3,
            color: "rgb(121, 199, 227)"
          },
          {
            "i-type": "B",
            count: 20,
            color: "rgb(26, 49, 119)"
          },
          { "i-type": "C", count: 24, color: "rgb(18, 147, 154)" }
        ]
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
    }
  });
  return (
    <VegaChart />
  )
}
