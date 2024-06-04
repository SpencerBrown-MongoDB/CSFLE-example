load("secrets/mongoURI.js");
load("secrets/localKey.js");
// Set the application document with a secret answer field that must be encrypted on the server side
doc = {question: "What is the meaning of life?", answer: "42"};
// Set the schema for automatic encryption of the answer field
schema = {
  "test.questions": {
    bsonType: "object",
    properties: {
      answer: {
        encrypt: {
          bsonType: "string",
          keyId: [UUID(keyID)],  
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
        },
      },
    },
  }
};
// set up the auto-encryption options with the schema this time
var autoEncryptionOpts = {
  "keyVaultNamespace" : "encryption.__dataKeys",
  "kmsProviders" : {
    "local" : {
      "key" : BinData(0, localKey),
    },
  },
  schemaMap: schema,
};
// connect to the Atlas deployment again with an encrypted client
csfleDatabaseConnection = Mongo(mongoURI, autoEncryptionOpts);
// Insert a document with an encrypted field
console.log("Inserting a document");
csfleDatabaseConnection.getDB("test").getCollection("questions").insertOne(doc);
// Read it back
console.log("Reading it back");
docsAsRead = csfleDatabaseConnection.getDB("test").getCollection("questions").find();
console.log(docsAsRead);