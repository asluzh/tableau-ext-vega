import { useEffect } from 'react'

// Declare this so our linter knows that tableau is a global object
/* global tableau */

export default function Configure(props) {
  useEffect(() => {
    console.debug('[Configure.jsx] useEffect props changed:', props);
  }, [props]);

  useEffect(() => {
    console.debug('[Configure.jsx] useEffect');
    //Initialise Extension
    tableau.extensions.initializeDialogAsync().then((openPayload) => {
      console.log('[Configure.js] Initialise Dialog', openPayload);
    });
  }, []);

  return (
      <>
      </>
  );
}
