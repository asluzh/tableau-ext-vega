// import { useState } from 'react'
import { createClassFromSpec } from "react-vega";
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

export default function App() {
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
