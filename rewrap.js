load("values.js")
load("secrets/mongoURI.js");
load("secrets/azureKey.js");
load("secrets/keyScript.js");

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
// connect to the Atlas deployment with an encrypted client using Azure CMK
azureDBConnection = Mongo(mongoURI, azureAutoEncryptionOpts);
azureKeyVault = azureDBConnection.getKeyVault();

results = azureKeyVault.rewrapManyDataKey(
  {},
  {
    provider: "azure",
    masterKey: {
      keyVaultEndpoint: azureVaultURI,
      keyName: azureCMKName,
      keyVersion: azureCMKNewVersion,
    },
  },
);
console.log("rewrap results:");
console.log(results);