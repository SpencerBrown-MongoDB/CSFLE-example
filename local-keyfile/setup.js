// Set the connection URI with credentials
load("secrets/mongoURI.js");
//
// part 1: set up the encryption DEKs
//
// Create a local master key (obviously this is not secure.. for testing only)
localKey = crypto.randomBytes(96).toString('base64')
// Save it as localKey.js
fs.writeFileSync("secrets/localKey.js", 'localKey = "' + localKey + "\";\n");
// set up the auto-encryption options
var autoEncryptionOpts = {
  "keyVaultNamespace" : "encryption.__dataKeys",
  "kmsProviders" : {
    "local" : {
      "key" : BinData(0, localKey),
    },
  },
};
// connect to the Atlas deployment with an encrypted client
csfleDatabaseConnection = Mongo(mongoURI, autoEncryptionOpts);
// Drop the previously created encryption and application DBs
csfleDatabaseConnection.getDB("encryption").dropDatabase();
csfleDatabaseConnection.getDB("test").dropDatabase();
// Create a new keyVault object and DEK
keyVault = csfleDatabaseConnection.getKeyVault();
keyVault.createKey("local", ["CSFLE-example-key"]);
// Get the key ID and write it to the local script
CSFLE_keyID = keyVault.getKeyByAltName("CSFLE-example-key")._id;
fs.appendFileSync("secrets/localKey.js", 'keyID = "' + CSFLE_keyID + "\";\n")