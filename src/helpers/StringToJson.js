
export default function StringToJson(str) {
  // console.log(convertJson(str));
  return JSON.parse(str);
}

function convertJson(jsonString) {
  try {
    jsonString = prepareJsonString(jsonString);
    return splitKeyValuesAndCreateObject(jsonString);
  } catch (error) {
    console.error(error);
  }
}

function splitKeyValuesAndCreateObject(keyValueString) {
  try {
    const splitKeyValueArray = keyValuePairSplitter(keyValueString);
    const splitKeyValueArrayLength = splitKeyValueArray.length;
    const returnObject = {};

    for (let keyValuePairCounter = 0; keyValuePairCounter < splitKeyValueArrayLength; keyValuePairCounter += 1) {
      const keyValuePair = splitKeyValueArray[keyValuePairCounter].trim();
      const keyValueSplit = keyValueSplitter(keyValuePair);

      const formattedKeyString = valueStringCheck(keyValueSplit[0].trim());
      returnObject[formattedKeyString] = valueStringCheck(keyValueSplit[1].trim());
    }

    return returnObject;
  } catch (error) {
    console.error(error);
    // throw new Error(error);
  }
}

function valueStringCheck(valueString) {
  try {
    if (!isNaN(valueString)) {
      return valueStringToNumber(valueString);
    }
    if (valueString[0] === '"') {
      return valueStringToString(valueString);
    }
    if (valueString[0] === '{') {
      return valueStringToObject(valueString);
    }
    if (valueString[0] === '[') {
      return valueStringToArray(valueString);
    }
    return valueString;
  } catch (error) {
    console.error(error);
    // throw new Error(error);
  }
}

function valueStringToNumber(numberString) {
  return parseFloat(numberString);
}

function valueStringToString(valueString) {
  valueString = valueString.replace(/"/g, '');
  return valueString.trim();
}

function valueStringToObject(valueString) {
  return convertJson(valueString);
}

function valueStringToArray(valueString) {
  const arrayString = prepareArrayString(valueString);
  return buildArray(arrayString);
}

function stringValueSplitter(arrayString) {
  try {
    const stringOpenCloseIndexes = charOccurrencesFinder(arrayString, '"');
    const stringArray = [];
    for (let stringIndexCounter = 0; stringIndexCounter < stringOpenCloseIndexes.length; stringIndexCounter += 2) {
      const stringValue = arrayString.substring(stringOpenCloseIndexes[stringIndexCounter] + 1, stringOpenCloseIndexes[stringIndexCounter + 1]);
      stringArray.push(stringValue);
    }
    return stringArray;
  } catch (error) {
    console.error(error);
    // throw new Error(error);
  }
}

function objectValueSplitter(arrayString) {
  try {
    const objectArray = [];
    while (arrayString.indexOf(',') !== -1) {
      const splitCharindex = arrayString.indexOf(',');
      const keyValuePair = arrayString.substring(0, splitCharindex);
      const returnValue = findObjects(keyValuePair, keyValuePair, arrayString, splitCharindex);
      const createdObject = convertJson(returnValue.keyValuePair);
      objectArray.push(createdObject);
      arrayString = arrayString.substring(returnValue.splitCharindex + 1).trim();
    }
    if (arrayString !== '') {
      const createdObject = convertJson(arrayString);
      objectArray.push(createdObject);
    }
    return objectArray;
  } catch (error) {
    console.error(error);
    // throw new Error(error);
  }
}

function findArray(keyValuePair, preparedValue, fullString, splitCharindex) {
  try {
    // If array not found inside key value pairs. Return key value pair
    if (preparedValue[0] !== '[') {
      return {
        keyValuePair,
        splitCharindex
      };
    }


    // There is an array in value.
    // Continue to check what is the main array start and end indexes
    const firstOpenIndex = keyValuePair.indexOf('[');
    const lastCloseIndex = fullString.lastIndexOf(']');
    const separatedString = fullString.substring(firstOpenIndex + 1, lastCloseIndex);
    const separatedStringFirstOpenIndex = separatedString.indexOf('[');
    /*
    * If there is only one array found as the value. Return the key and value array
    * Example string - testField: [ value1, value2 ]
    */
    if (separatedStringFirstOpenIndex === -1) {
      return {
        keyValuePair: fullString.substring(0, lastCloseIndex + 1),
        splitCharindex: lastCloseIndex
      };
    }

    const separatedStringFirstCloseIndex = separatedString.indexOf(']');
    // If there are separate array found. Return key and first value array
    // Example string - firstTestField: [ value1, value2 ], secondTestField: [ value3, value4 ]
    if (separatedStringFirstCloseIndex < separatedStringFirstOpenIndex) {
      return {
        keyValuePair: fullString.substring(0, firstOpenIndex + separatedStringFirstCloseIndex + 2),
        splitCharindex: firstOpenIndex + separatedStringFirstCloseIndex + 2
      }
    }
  } catch (error) {
    console.error(error);
    // throw new Error(error);
  }
}

function resetCharacter(resetingIndex, valueString) {
  try {
    return valueString.substring(0, resetingIndex) + '' + valueString.substring(resetingIndex + 1);
  } catch (error) {
    console.error(error);
    // throw new Error(error);
  }
};

function prepareJsonString(jsonString) {
  try {
    jsonString = resetCharacter(jsonString.indexOf('{'), jsonString);
    jsonString = resetCharacter(jsonString.lastIndexOf('}'), jsonString);

    return jsonString.trim();
  } catch (error) {
    console.error(error);
    // throw new Error(error);
  }
}

function prepareArrayString(arrayString) {
  try {
    arrayString = resetCharacter(arrayString.indexOf('['), arrayString);
    arrayString = resetCharacter(arrayString.lastIndexOf(']'), arrayString);
    return arrayString.trim();
  } catch (error) {
    console.error(error);
    // throw new Error(error);
  }
}

function keyValueSplitter(keyValuePair) {
  try {
    const splitCharindex = keyValuePair.indexOf(':');
    return [keyValuePair.substring(0, splitCharindex), keyValuePair.substring(splitCharindex + 1)]
  } catch (error) {
    console.error(error);
    // throw new Error(error);
  }
}

function prepareValueOnly(keyValuePair) {
  try {
    const seperatedValue = keyValueSplitter(keyValuePair);
    return seperatedValue[1].trim();
  } catch (error) {
    console.error(error);
    // throw new Error(error);
  }
}

// Assume there are no commas inside string values
function keyValuePairSplitter(allKeyValuePairsString) {
  try {
    const keyValuePairArray = [];
    while (allKeyValuePairsString.indexOf(',') !== -1) {
      const splitCharindex = allKeyValuePairsString.indexOf(',');
      const keyValuePair = allKeyValuePairsString.substring(0, splitCharindex);
      const preparedValue = prepareValueOnly(keyValuePair);
      let returnValue = findObjects(keyValuePair, preparedValue, allKeyValuePairsString, splitCharindex);
      if (!returnValue.objectFound) {
        returnValue = findArray(keyValuePair, preparedValue, allKeyValuePairsString, splitCharindex);
      }
      keyValuePairArray.push(returnValue.keyValuePair);
      allKeyValuePairsString = allKeyValuePairsString.substring(returnValue.splitCharindex + 1).trim();
      if (allKeyValuePairsString[0] === ',') {
        allKeyValuePairsString = allKeyValuePairsString.slice(1).trim();
      }
    }

    if (allKeyValuePairsString !== '') {
      keyValuePairArray.push(allKeyValuePairsString);
    }

    return keyValuePairArray;
  } catch (error) {
    console.error(error);
    // throw new Error(error);
  }
}

function buildArray(arrayString) {
  try {
    if (arrayString[0] === '"') {
      return stringValueSplitter(arrayString);
    }
    if (arrayString[0] === '{') {
      return objectValueSplitter(arrayString);
    }
  } catch (error) {
    console.error(error);
    // throw new Error(error);
  }
}

function charOccurrencesFinder(valueString, findingChar) {
  try {
    const occurrenceArray = [];
    let startIndex = 0;
    while (valueString.indexOf(findingChar, startIndex) !== -1) {
      const occurrenceIndex = valueString.indexOf(findingChar, startIndex);
      occurrenceArray.push(occurrenceIndex);
      startIndex = occurrenceIndex + 1;
    }
    return occurrenceArray;
  } catch (error) {
    console.error(error);
    // throw new Error(error);
  }
};

function getClosingBracketIndexOfMainObject(separatedString) {
  try {
    const allOpenIndexes = charOccurrencesFinder(separatedString, '{');
    const allCloseIndexes = charOccurrencesFinder(separatedString, '}');
    let closeIndexHasNoOpen = 0;
    let closeIndexCounter = 0;
    while (true) {
      closeIndexHasNoOpen = allCloseIndexes[closeIndexCounter];
      const lowestOpenOccurrence = allOpenIndexes.findIndex(element => element < closeIndexHasNoOpen);
      if (lowestOpenOccurrence === -1) {
        break;
      }

      allOpenIndexes.splice(lowestOpenOccurrence, 1);
      closeIndexCounter += 1;
    }
    return closeIndexHasNoOpen;
  } catch (error) {
    console.error(error);
    // throw new Error(error);
  }
};

function findObjects(keyValuePair, preparedValue, fullString, splitCharindex) {
  try {
    // If object not found inside key value pairs. Return key value pair
    if (preparedValue[0] !== '{') {
      return {
        keyValuePair,
        splitCharindex,
        objectFound: false
      };
    }

    // There is an object in value.
    // Continue to check what is the main object start and end indexes
    const firstOpenIndex = keyValuePair.indexOf('{');
    const lastCloseIndex = fullString.lastIndexOf('}');
    const separatedString = fullString.substring(firstOpenIndex + 1, lastCloseIndex);
    const separatedStringFirstOpenIndex = separatedString.indexOf('{');

    // If there is only one object found as the value. Return the key and value object
    // Example string - testField: { value: "hi Guys" }
    if (separatedStringFirstOpenIndex === -1) {
      return {
        keyValuePair: fullString.substring(0, lastCloseIndex + 1),
        splitCharindex: lastCloseIndex,
        objectFound: true
      };
    }

    const separatedStringFirstCloseIndex = separatedString.indexOf('}');
    // If there are separate objects found. Return key and first value object
    // Example string - firstTestField: { value: "hi Guys" }, secondTestField: { value: "How are you" }
    if (separatedStringFirstCloseIndex < separatedStringFirstOpenIndex) {
      return {
        keyValuePair: fullString.substring(0, firstOpenIndex + separatedStringFirstCloseIndex + 2),
        splitCharindex: firstOpenIndex + separatedStringFirstCloseIndex + 2,
        objectFound: true
      };
    }

    // There are object inside object. Finding the index of the closing bracket index of main object
    // Example string - firstTestField: { value: "hi Guys", insideField: { secondValue: "Where are you" } }, secondTestField: { value: "How are you" }
    const mainClosingIndex = getClosingBracketIndexOfMainObject(separatedString);

    return {
      keyValuePair: fullString.substring(0, firstOpenIndex + mainClosingIndex + 2),
      splitCharindex: firstOpenIndex + mainClosingIndex + 2,
      objectFound: true
    };
  } catch (error) {
    console.error(error);
    // throw new Error(error);
  }
}
