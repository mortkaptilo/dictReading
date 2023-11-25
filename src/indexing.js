import fs from 'fs'






function getBase(input) {
  const charCode = input.charCodeAt(0);

  if (charCode >= 65 && charCode <= 90) { // 'A' to 'Z'
      return charCode - 65;
  } else if (charCode >= 97 && charCode <= 122) { // 'a' to 'z'
      return charCode - 71;
  } else if (charCode >= 48 && charCode <= 57) { // '0' to '9'
      return charCode + 4;
  } else if (input === '+') {
      return 62;
  } else if (input === '/') {
      return 63;
  } else {
   
      throw new Error("Invalid input character");
  }
}


function decodeNumber(word) {
  let offset = 0;
  const reversedWordArray = Array.from(word).reverse();

  for (let i = 0; i < reversedWordArray.length; i++) {
      try {
          const baseValue = getBase(reversedWordArray[i]);
          offset += baseValue * Math.pow(64, i);
      } catch (error) {
       
          throw new Error(`Invalid character at position ${i}: ${reversedWordArray[i]}`);
      }
  }

  return offset;
}


function parseLine(line) {
  const words = line.split('\t');

  // Extract word
  const word = words[0];
  const startOffsetStr = words[1];
  const lengthStr = words[2];


  if (word === undefined || startOffsetStr === undefined || lengthStr === undefined  ) {
      throw new Error('unregonized .index file line');
  }

  
  let startOffset;
  try {
    
      startOffset = decodeNumber( words[1]);
  } catch (error) {
      throw new Error(`Invalid start offset `);
  }


  let length;
  try {
      length = decodeNumber(lengthStr);
  } catch (error) {
      throw new Error(`Invalid length at line ${lineNumber}: ${error.message}`);
  }

  return [word, startOffset, length];
}



function findPosition(fd, low, high, searchString, bufferSize = 1024) {
    if (high >= low) {
        const mid = low + Math.floor((high - low) / 2);

        const buffer = Buffer.alloc(bufferSize);
        fs.readSync(fd, buffer, 0, bufferSize, mid);

        // Find the nearest newline to avoid partial line reading
        const startIndex = buffer.indexOf('\n', mid % bufferSize) + 1;
        const endIndex = buffer.indexOf('\n', startIndex);

        const line = buffer.toString('utf8', startIndex, endIndex !== -1 ? endIndex : undefined);
        const [word] = line.split('\t');

        if (word < searchString) {
            return findPosition(fd, mid + 1, high, searchString, bufferSize);
        } else if (word > searchString) {
            return findPosition(fd, low, mid - 1, searchString, bufferSize);
        } else {
            return parseLine(line);
        }
    }
    return null;
}

export function binarySearchInIndex(filePath, searchString) {
    const fd = fs.openSync(filePath, 'r');
    const fileStats = fs.fstatSync(fd);
    const result = findPosition(fd, 0, fileStats.size, searchString);
    fs.closeSync(fd);
    return result;
}





