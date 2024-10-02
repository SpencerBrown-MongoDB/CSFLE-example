load("values.js")
load("secrets/mongoURI.js");
load("secrets/azureKey.js");
load("secrets/keyScript.js");

// Set the application document with a secret answer field that must be encrypted on the server side
doc = {question: "What is the meaning of life?", answer: "42"};

// Set the schema for automatic encryption of the answer field with local CMK
localSchema = {
  [appDB+"."+localAppCollection]: {
    bsonType: "object",
    properties: {
      answer: {
        encrypt: {
          bsonType: "string",
          keyId: [UUID(localDEKID)],  
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
        },
      },
    },
  }
};

// Set the schema for automatic encryption of the answer field with azure CMK
azureSchema = {
  [appDB+"."+azureAppCollection]: {
    bsonType: "object",
    properties: {
      answer: {
        encrypt: {
          bsonType: "string",
          keyId: [UUID(azureDEKID)],  
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
        },
      },
    },
  }
};

// set up the auto-encryption options for local CMK 
var localAutoEncryptionOpts = {
  keyVaultNamespace: DEKDB + "." + localDEKCollection,
  kmsProviders: {
    local: {
      key: BinData(0, localCMK),
    },
  },
  schemaMap: localSchema,
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
  schemaMap: azureSchema,
};

// connect to the Atlas deployment with an encrypted local client
localDBConnection = Mongo(mongoURI, localAutoEncryptionOpts);
// Insert a document with an encrypted field
console.log("Inserting a document encrypted with local CMK");
localDBConnection.getDB(appDB).getCollection(localAppCollection).insertOne(doc);
// Read it back
console.log("Reading it back");
docsAsRead = localDBConnection.getDB(appDB).getCollection(localAppCollection).find();
console.log(docsAsRead);

// connect to the Atlas deployment with an encrypted azure client
azureDBConnection = Mongo(mongoURI, azureAutoEncryptionOpts);
// Insert a document with an encrypted field
console.log("Inserting a document encrypted with azure CMK");
azureDBConnection.getDB(appDB).getCollection(azureAppCollection).insertOne(doc);
// Read it back
console.log("Reading it back");
docsAsRead = azureDBConnection.getDB(appDB).getCollection(azureAppCollection).find();
console.log(docsAsRead);