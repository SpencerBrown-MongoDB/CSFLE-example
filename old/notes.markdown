[working from doc page](https://www.mongodb.com/docs/mongodb-shell/field-level-encryption/)

what they don't say:

## Install mongosh

download mongosh from https://www.mongodb.com/try/download/shell instead of homebrew, so you get all the dependencies

## Create the application data collection

run `mongosh` to connect to your cluster 
note: the use of the `tlsCertificateKeyFile` option on the connection string URI is undocumented but it appears to work. 

```bash
mongosh 'mongodb+srv://test-csfle.y2opw.mongodb.net/?authSource=$external&authMechanism=MONGODB-X509&tlsCertificateKeyFile=secrets/CSFLE-example.pem'
```

then run 

```js
doc = {question: "What is the meaning of life?", answer: 42};
schema = {
  "test.questions": {
    bsonType: "object",
    encryptMetadata: {

    }
  }
};
```

## Create the encryption key

so maybe we can just run `mongosh --nodb` and let Mongo() do the work. 

and enter:

```js
// Set the connection URI with credentials
mongoURI = 'mongodb+srv://test-csfle.y2opw.mongodb.net/?authSource=$external&authMechanism=MONGODB-X509&tlsCertificateKeyFile=secrets/CSFLE-example.pem';
//
// part 1: set up the encryption DEKs
//
// set up the auto-encryption options
localKey = crypto.randomBytes(96).toString('base64')
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
// Show the DEKs in the encryption.__dataKeys collection
csfleDatabaseConnection.getDB("encryption").getCollection("__dataKeys").find();
// Show the indexes; should include unique index on keyAltNames
csfleDatabaseConnection.getDB("encryption").getCollection("__dataKeys").getIndexes();
// Get the key ID
CSFLE_keyID = keyVault.getKeyByAltName("CSFLE-example-key")._id;

//
// part 2: reconnect, with an automatic encryption schema set up to use the DEK
//         (we have to reconnect because the schema needs the key ID)

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
          keyId: [CSFLE_keyID],  
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
csfleDatabaseConnection.getDB("test").getCollection("questions").insertOne(doc);
// Read it back
csfleDatabaseConnection.getDB("test").getCollection("questions").find();
```