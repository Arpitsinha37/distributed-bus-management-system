const fs = require('fs');
const path = require('path');
const legacyPath = 'D:\\New road travels\\redbus-clone\\cms-platform\\apps\\api\\src\\modules\\payment\\paco-gateway.service.ts';
const newPath = 'd:\\distributed bus management system\\bus-booking-backend\\src\\payments\\providers\\paco.provider.ts';

const legacyContent = fs.readFileSync(legacyPath, 'utf8');
let newContent = fs.readFileSync(newPath, 'utf8');

// Use string operations to extract keys
function extractVal(propName) {
  let idx = legacyContent.indexOf('private readonly ' + propName);
  if(idx === -1) return null;
  let idx2 = legacyContent.indexOf("'", idx);
  let idx3 = legacyContent.indexOf("'", idx2 + 1);
  return legacyContent.substring(idx2 + 1, idx3);
}

function extractApiKey(prefix) {
  let idx = legacyContent.indexOf(prefix);
  if(idx === -1) return null;
  let idx2 = legacyContent.indexOf("'", idx);
  let idx3 = legacyContent.indexOf("'", idx2 + 1);
  return legacyContent.substring(idx2 + 1, idx3);
}

const paymentEndpoint = extractVal('paymentEndpoint');
const merchantId = extractVal('merchantId');
const encryptionKeyId = extractVal('encryptionKeyId');
const merchantSigningPrivateKeyB64 = extractVal('merchantSigningPrivateKeyB64');
const pacoEncryptionPublicKeyB64 = extractVal('pacoEncryptionPublicKeyB64');
const pacoSigningPublicKeyB64 = extractVal('pacoSigningPublicKeyB64');
const merchantDecryptionPrivateKeyB64 = extractVal('merchantDecryptionPrivateKeyB64');

const apiKeyNPR = extractApiKey('NPR: process.env.PACO_API_KEY_NPR');
const apiKeyUSD = extractApiKey('USD: process.env.PACO_API_KEY_USD');

function replaceVal(propName, newVal) {
  let searchStr = 'private readonly ' + propName;
  let idx = newContent.indexOf(searchStr);
  if(idx === -1) return;
  let idx2 = newContent.indexOf("'", idx);
  let idx3 = newContent.indexOf("'", idx2 + 1);
  
  newContent = newContent.substring(0, idx2 + 1) + newVal + newContent.substring(idx3);
}

function replaceApiKey(prefix, newVal) {
  let idx = newContent.indexOf(prefix);
  if(idx === -1) return;
  let idx2 = newContent.indexOf("'", idx);
  let idx3 = newContent.indexOf("'", idx2 + 1);
  
  newContent = newContent.substring(0, idx2 + 1) + newVal + newContent.substring(idx3);
}

replaceVal('paymentEndpoint', paymentEndpoint);
replaceVal('merchantId', merchantId);
replaceVal('encryptionKeyId', encryptionKeyId);
replaceVal('merchantSigningPrivateKeyB64', merchantSigningPrivateKeyB64);
replaceVal('pacoEncryptionPublicKeyB64', pacoEncryptionPublicKeyB64);
replaceVal('pacoSigningPublicKeyB64', pacoSigningPublicKeyB64);
replaceVal('merchantDecryptionPrivateKeyB64', merchantDecryptionPrivateKeyB64);

replaceApiKey('NPR: process.env.PACO_API_KEY_NPR', apiKeyNPR);
replaceApiKey('USD: process.env.PACO_API_KEY_USD', apiKeyUSD);

fs.writeFileSync(newPath, newContent);
console.log('Successfully updated PACO keys in paco.provider.ts');
