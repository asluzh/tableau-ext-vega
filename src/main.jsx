import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Extension from './Extension.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Extension />
  </StrictMode>,
)
