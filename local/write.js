load("values.js")
load("secrets/keyScript.js");

// Set the application document with a secret answer field that must be encrypted on the server side
doc = {question: "What is the meaning of life?", answer: "42"};

// Set the schema for automatic encryption of the answer field
schema = {
  [appDB+"."+appCollection]: {
    bsonType: "object",
    properties: {
      answer: {
        encrypt: {
          bsonType: "string",
          keyId: [UUID(DEKID)],  
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
        },
      },
    },
  }
};
// set up the auto-encryption options
var autoEncryptionOpts = {
  keyVaultNamespace: DEKDB + "." + DEKCollection,
  kmsProviders: {
    local: {
      key: BinData(0, CMK),
    },
  },
  schemaMap: schema,
};
// connect to the Atlas deployment with an encrypted client
DBConnection = Mongo(mongoURI, autoEncryptionOpts);
// Insert a document with an encrypted field
console.log("Inserting a document with an encrypted field");
DBConnection.getDB(appDB).getCollection(appCollection).insertOne(doc);
// Read it back
console.log("Reading it back");
docsAsRead = DBConnection.getDB(appDB).getCollection(appCollection).find();
// Print the decrypted answer
console.log(docsAsRead);
// Close the connection
DBConnection.close();

// connect to the Atlas deployment with a normal client
DBConnection = Mongo(mongoURI);
// Read the document
console.log("Reading the document with a non-encrypted client"); 
docsAsRead = DBConnection.getDB(appDB).getCollection(appCollection).find();
// Print the answer
console.log(docsAsRead);
// Close the connection
DBConnection.close();
