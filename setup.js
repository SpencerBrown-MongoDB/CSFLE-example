// get the values
load("values.js"); 
// get the keys
load(secretsDir + "/keyScript.js");
load(secretsDir + "/azureKey.js");
// Set the connection URI with credentials
load(secretsDir + "/mongoURI.js");
//
// part 1: set up the local encryption DEKs
//
// Create a local master key (obviously this is not secure.. for testing only)
localCMK = crypto.randomBytes(96).toString('base64')
// Save it in the secret place
fs.writeFileSync(secretsDir + "/" + keyScript, 'localCMK = "' + localCMK + "\";\n");
// set up the auto-encryption options for local CMK 
var localAutoEncryptionOpts = {
  keyVaultNamespace: DEKDB + "." + localDEKCollection,
  kmsProviders: {
    local: {
      key: BinData(0, localCMK),
    },
  },
};
// set up the auto-encryption options for azure CMK 
var azureAutoEncryptionOpts = {
  keyVaultNamespace: DEKDB + "." + azureDEKCollection,
  kmsProviders: {
    azure: {
      tenantId: azureTenantID,
      clientId: azureClientID,
      clientSecret: azureClientSecret,
    },
  },
};
// connect to the Atlas deployment with an encrypted client using local CMK
localDBConnection = Mongo(mongoURI, localAutoEncryptionOpts);
// connect to the Atlas deployment with an encrypted client using Azure CMK
azureDBConnection = Mongo(mongoURI, azureAutoEncryptionOpts);
// Drop the previously created DEK and application DBs
localDBConnection.getDB(DEKDB).dropDatabase();
localDBConnection.getDB(appDB).dropDatabase();

// Create a new keyVault object and DEK for local CMK
localKeyVault = localDBConnection.getKeyVault();
localKeyVault.createKey(
  "local", 
  [DEKName],
);
// Get the local DEK ID and write it to the key script
localDEKID = localKeyVault.getKeyByAltName(DEKName)._id;
fs.appendFileSync(secretsDir + "/" + keyScript, 'localDEKID = "' + localDEKID + "\";\n")

// Create a new keyVault object and DEK for azure CMK
azureKeyVault = azureDBConnection.getKeyVault();
azureKeyVault.createKey(
  "azure", 
  {
    keyVaultEndpoint: azureVaultURI,
    keyName: azureCMKName,
    keyVersion: azureCMKVersion,
  },
  [DEKName],
);
// Get the azure DEK ID and write it to the key script
azureDEKID = azureKeyVault.getKeyByAltName(DEKName)._id;
fs.appendFileSync(secretsDir + "/" + keyScript, 'azureDEKID = "' + azureDEKID + "\";\n")