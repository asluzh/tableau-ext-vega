// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Extension from './Extension.jsx'

// console.debug('Running in ' + (import.meta.env.DEV ? 'development' : 'production') + ' mode');
// console.debug('Vite base path is ' + import.meta.env.BASE_URL);

createRoot(document.getElementById('root')).render(<Extension />)
// <StrictMode>
//   <Extension />
// </StrictMode>
