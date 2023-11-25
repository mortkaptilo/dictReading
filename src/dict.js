import { binarySearchInIndex } from "./indexing.js";
import fs from 'fs'
import zlib from 'zlib'


function readFromBuffer(buffer, startOffset, length) {
  // Extract the specified portion from the buffer
  const extractedBuffer = buffer.slice(startOffset, startOffset + length);
  // Convert the extracted buffer to a string and return it
  return extractedBuffer.toString('utf8');
}

function readFromDictDz(compressedFilePath, decodedLine) {
  const [_, startOffset, length] = decodedLine;

  // Read the compressed file synchronously
  const compressedData = fs.readFileSync(compressedFilePath);

  // Decompress the data synchronously
  const decompressedData = zlib.gunzipSync(compressedData);

  // Use the function to read from the buffer
  return readFromBuffer(decompressedData, startOffset, length);
}


export function readFromDict(filePath, decodedLine) {
  const [_, startOffset, length] = decodedLine;

  // Open the file synchronously 
  const fd = fs.openSync(filePath, 'r');

  // Create a buffer of the specified length
  const buffer = Buffer.alloc(length);

  // Read the specified portion of the file into the buffer
  fs.readSync(fd, buffer, 0, length, startOffset);

  // Close the file descriptor
  fs.closeSync(fd);

  // Convert the buffer to a string and return it
  return buffer.toString('utf8');
}


export function readFromDictOrDz(filePath, word) {

  const pathWords = filePath.split('.')

  

  if (  pathWords[pathWords.length-1] === 'dict') {

    const indexFilePath = filePath.replace(/(\.dict|\.dict\.dz)$/, '.index');

 
    const decodedLine= binarySearchInIndex(indexFilePath, word)  
  
   
    return readFromDict(filePath, decodedLine)
  }
  else if (pathWords[pathWords.length-1] === 'dz' && pathWords[pathWords.length-2] ==='dict'){

    const indexFilePath = filePath.replace(/(\.dict|\.dict\.dz)$/, '.index');
    const decodedLine= binarySearchInIndex(indexFilePath, word)  
   
    return readFromDictDz(filePath, decodedLine)
  }
  else {
    throw Error('only .dict and .dict.dz supported');
     
  }

}





