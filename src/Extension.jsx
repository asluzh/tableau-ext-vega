import { useEffect, useState, useRef } from 'react'
import embed from 'vega-embed';
import JSON5 from 'json5'
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
  const [embedOptions, setEmbedOptions] = useState(null);
  const [jsonSpec, setJsonSpec] = useState(null);

  useEffect(() => {
    let listenerFilterChanged = false;
    let listenerSummaryDataChanged = false;
    let listenerDashboardLayoutChanged = false;
    let unregisterFilterChangedListener = null;
    let unregisterSummaryDataChangedListener = null;
    let unregisterDashboardLayoutChangedListener = null;
    let cancel = false;
    const updateData = async (worksheet) => {
      console.debug('[Extension.jsx] updateData from', worksheet.name);
      if (cancel) {
        console.debug('[Extension.jsx] updateData cancelled');
        return;
      }
      try {
        const dataTableReader = await worksheet.getSummaryDataReaderAsync(undefined, {
          // applyWorksheetFormatting: true,
          // ignoreAliases: true,
          ignoreSelection: true,
          // includeDataValuesOption: tableau.IncludeDataValuesOption.AllValues, // AllValues, OnlyFormattedValues, OnlyNativeValues
          // maxRows: 0, // 0 means no limit
        });
        console.debug('[Extension.jsx] data reader row count:', dataTableReader.totalRowCount);
        if (dataTableReader.pageCount > 0) {
          try {
            const dataTable = await dataTableReader.getAllPagesAsync();
            // console.debug('[Extension.jsx] getAllPagesAsync dataTable:', dataTable);
            const columns = dataTable.columns.map(col => col.fieldName);
            console.debug('[Extension.jsx] worksheet columns:', columns);
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
        } else {
          console.log('[Extension.jsx] Empty data in worksheet:', worksheet.name);
          setData([]);
        }
      } catch (err) {
        console.error('[Extension.jsx] getSummaryDataReaderAsync failed:', err.toString());
        setData([]);
      } finally {
        if (listenerFilterChanged && !unregisterFilterChangedListener) {
          console.debug('[Extension.jsx] added FilterChanged event listener');
          unregisterFilterChangedListener = worksheet.addEventListener(tableau.TableauEventType.FilterChanged, () => {
            console.debug('[Extension.jsx] FilterChanged event');
            updateData(worksheet);
          });
        }
        if (listenerSummaryDataChanged && !unregisterSummaryDataChangedListener) {
          console.debug('[Extension.jsx] added SummaryDataChanged event listener');
          unregisterSummaryDataChangedListener = worksheet.addEventListener(tableau.TableauEventType.SummaryDataChanged, () => {
            console.debug('[Extension.jsx] SummaryDataChanged event');
            updateData(worksheet);
          });
        }
        if (listenerDashboardLayoutChanged && !unregisterDashboardLayoutChangedListener) {
          console.debug('[Extension.jsx] added DashboardLayoutChanged event listener');
          unregisterDashboardLayoutChangedListener = worksheet.parentDashboard.addEventListener(tableau.TableauEventType.DashboardLayoutChanged, () => {
            console.debug('[Extension.jsx] DashboardLayoutChanged event');
            // TODO what could be updated here - view size?
            // vegaEmbed.current.view.width = 400; // window.innerWidth * 0.8;
            // vegaEmbed.current.view.height = 500; // window.innerHeight * 0.8;
            // vegaEmbed.current.view.runAsync();
            // updateData(worksheet);
          });
        }
      }
    };
    const updateSettings = async () => {
      let sheet = tableau.extensions.settings.get('sheet');
      console.debug('[Extension.jsx] data sheet', sheet);
      setEmbedOptions(JSON5.parse(tableau.extensions.settings.get('embedOptions')));
      setJsonSpec(JSON5.parse(tableau.extensions.settings.get('jsonSpec')));
      listenerFilterChanged = tableau.extensions.settings.get('listenerFilterEvent') === 'true';
      listenerSummaryDataChanged = tableau.extensions.settings.get('listenerDataChanged') === 'true';
      listenerDashboardLayoutChanged = tableau.extensions.settings.get('listenerDashboardLayout') === 'true';
      ref.current.style = tableau.extensions.settings.get('mainDivStyle');
      // console.debug('[Extension.jsx] ref style:', ref.current.style);
      // width: 100vw; height: calc(100vh - 4px); border: 1px dashed lightgray;
      // DashboardLayoutChanged event is always useful in authoring mode, so enable it automatically
      // if (tableau.extensions.environment.mode === "authoring") {
      //   listenerDashboardLayoutChanged = true;
      // }
      if (unregisterFilterChangedListener) {
        unregisterFilterChangedListener();
        unregisterFilterChangedListener = null;
        console.debug('[Extension.jsx] removed FilterChanged event listener');
      }
      if (unregisterSummaryDataChangedListener) {
        unregisterSummaryDataChangedListener();
        unregisterSummaryDataChangedListener = null;
        console.debug('[Extension.jsx] removed SummaryDataChanged event listener');
      }
      if (unregisterDashboardLayoutChangedListener) {
        unregisterDashboardLayoutChangedListener();
        unregisterDashboardLayoutChangedListener = null;
        console.debug('[Extension.jsx] removed DashboardLayoutChanged event listener');
      }
      if (sheet) {
        const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
        const worksheet = worksheets.find(s => s.name == sheet);
        // console.debug('[Extension.jsx] worksheets', worksheets);
        if (!worksheet) {
          console.warn('[Extension.jsx] Worksheet not found:', sheet);
          setData([]);
          return;
        }
        updateData(worksheet);
      }
    }
    console.debug('[Extension.jsx] useEffect');
    let unregisterSettingsChangedListener = null;
    tableau.extensions.initializeAsync({'configure': configure}).then(() => {
      console.debug('[Extension.jsx] initializeAsync completed');
      updateSettings();
      unregisterSettingsChangedListener = tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (e) => {
        console.debug('[Extension.jsx] Settings changed:', e);
        updateSettings();
      });
    }, (err) => {
      console.error('[Extension.jsx] initializeAsync failed:', err.toString());
    });
    return () => {
      cancel = true;
      console.debug('[Extension.jsx] useEffect unmount');
      if (unregisterSettingsChangedListener) {
        unregisterSettingsChangedListener();
        unregisterSettingsChangedListener = null;
        console.debug('[Extension.jsx] removed SettingsChanged event listener');
      }
      if (unregisterFilterChangedListener) {
        unregisterFilterChangedListener();
        unregisterFilterChangedListener = null;
        console.debug('[Extension.jsx] removed FilterChanged event listener');
      }
      if (unregisterSummaryDataChangedListener) {
        unregisterSummaryDataChangedListener();
        unregisterSummaryDataChangedListener = null;
        console.debug('[Extension.jsx] removed SummaryDataChanged event listener');
      }
      if (unregisterDashboardLayoutChangedListener) {
        unregisterSummaryDataChangedListener();
        unregisterSummaryDataChangedListener = null;
        console.debug('[Extension.jsx] removed DashboardLayoutChanged event listener');
      }
      vegaEmbed.current?.finalize();
    };
  }, []);

  useEffect(() => {
    console.debug('[Extension.jsx] useEffect data update');
    // TODO add option to show banner text when empty data, instead of blank chart
    if (data) {
      if (!vegaEmbed.current) {
        console.debug('[Extension.jsx] No embed instance yet');
      } else {
        vegaEmbed.current.view.data("vizdata", data).runAsync();
      }
    }
  }, [vegaEmbed, data]);

  useEffect(() => {
    console.debug('[Extension.jsx] useEffect embed settings update');
    const createView = async () => {
      if (ref.current && embedOptions && jsonSpec) {
        try {
          if (vegaEmbed.current) {
            if (JSON5.stringify(vegaEmbed.current.spec) !== JSON5.stringify(jsonSpec)) {
              console.debug('[Extension.jsx] new spec received, re-embedding');
              await vegaEmbed.current.finalize();
              vegaEmbed.current = await embed(ref.current, jsonSpec, embedOptions);
            }
            if (JSON5.stringify(vegaEmbed.current.embedOptions) !== JSON5.stringify(embedOptions)) {
              console.debug('[Extension.jsx] new options received, re-embedding');
              console.debug('[Extension.jsx] old options:', vegaEmbed.current.embedOptions);
              console.debug('[Extension.jsx] new options:', embedOptions);
              await vegaEmbed.current.finalize();
              vegaEmbed.current = await embed(ref.current, jsonSpec, embedOptions);
            }
          } else if (!vegaEmbed.current) {
            console.debug('[Extension.jsx] initial embedding');
            vegaEmbed.current = await embed(ref.current, jsonSpec, embedOptions);
            // TODO handle WARN Infinite extent for field "x": [Infinity, -Infinity]
          }
        } catch (err) {
          console.error('[Extension.jsx] Error creating view:', err.toString());
        }
      }
    };
    createView();
  }, [vegaEmbed, embedOptions, jsonSpec]);

  return (
    <div ref={ref} />
  )
}
