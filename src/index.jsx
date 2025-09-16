// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Extension from './Extension.jsx'
import { StrictMode } from 'react'

// console.debug('Running in ' + (import.meta.env.DEV ? 'development' : 'production') + ' mode');
// console.debug('Vite base path is ' + import.meta.env.BASE_URL);

createRoot(document.getElementById('root')).render(
<StrictMode>
  <Extension />
</StrictMode>
);
