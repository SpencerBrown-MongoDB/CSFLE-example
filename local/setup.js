// get the values
load("values.js"); 
// Create a local master key (obviously this is not secure.. for testing only)
CMK = crypto.randomBytes(96).toString('base64')
// Save it to the keyScript file (overwrites existing file)
fs.mkdirSync(secretsDir, { recursive: true });
fs.writeFileSync(keyScriptFile, 'CMK = "' + CMK + "\";\n");
// set up the auto-encryption options
var autoEncryptionOpts = {
  keyVaultNamespace: DEKDB + "." + DEKCollection,
  kmsProviders: {
    local: {
      key: BinData(0, CMK),
    },
  },
};
// connect to the Atlas deployment with an encrypted client
DBConnection = Mongo(mongoURI, autoEncryptionOpts);
// Drop the previously created DEK and application DBs
DBConnection.getDB(DEKDB).dropDatabase();
DBConnection.getDB(appDB).dropDatabase();
// Create a new keyVault object and DEK
keyVault = DBConnection.getKeyVault();
keyVault.createKey(
  "local", 
  [DEKName],
);
// Get the local DEK ID and write it to the keyScript file
DEKID = keyVault.getKeyByAltName(DEKName)._id;
fs.appendFileSync(keyScriptFile, 'DEKID = "' + DEKID + "\";\n")
