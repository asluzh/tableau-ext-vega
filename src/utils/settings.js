import logger from "./logger"

const CONFIG_META_VERSION = 1;
const DEFAULT_CONFIG = {
  sheet: "",
  listenerDataChanged: "",
  jsonSpec: '{}',
  embedOptions: '{ "actions": false, "config": {} }',
  mainDivStyle: 'width: 100vw; height: 100vh;',
}

export function loadConfig() {
  const allSettings = tableau.extensions.settings.getAll();
  if (Object.keys(allSettings).length > 0) {
    logger.debug("Existing settings found:", allSettings);
    try {
      if ("metaVersion" in allSettings && parseInt(allSettings.metaVersion)) {
        let metaVersion = parseInt(tableau.extensions.settings.get('metaVersion'));
        if (metaVersion > CONFIG_META_VERSION) {
          logger.warn('Newer meta version detected in settings!')
          return;
        }
        if (metaVersion < CONFIG_META_VERSION) {
          logger.log('Older meta version detected in saved settings, some settings may be missing');
        }
        let parsedConfig = {...DEFAULT_CONFIG}; // create a shallow copy
        Object.entries(allSettings).forEach(([key, value]) => {
          if (key in parsedConfig) {
            parsedConfig[key] = value;
          }
        });
        return parsedConfig;
      }
    } catch (e) {
      logger.error("Error updating settings:", e);
      return DEFAULT_CONFIG;
    }
  } else {
    return DEFAULT_CONFIG;
  }
}

export function defaultConfig() {
  return DEFAULT_CONFIG;
}

export async function saveConfig(config) {
  return new Promise((resolve, reject) => {
    tableau.extensions.settings.set('metaVersion', CONFIG_META_VERSION);
    // iterate through config object and save each key/value pair
    Object.entries(config).forEach(([key, value]) => {
      logger.debug("Setting", key, "=", config[key]);
      tableau.extensions.settings.set(key, value);
    });
    const existingSettings = tableau.extensions.settings.getAll();
    Object.keys(existingSettings).forEach((key) => {
      if (key !== "metaVersion" && !(key in config)) {
        logger.debug(`Erasing "${key}" in extension settings`);
        tableau.extensions.settings.erase(key);
      }
    });
    tableau.extensions.settings.saveAsync().then(resolve, reject);
  });
}
