This directory should contain:

## secrets/mongoURI.js

with this content (as an example; replace with your own connection string with credentials)

```js
mongoURI = "mongodb+srv://testlogs.y2opw.mongodb.net/?authSource=$external&authMechanism=MONGODB-X509&tlsCertificateKeyFile=CSFLE-example.pem";
```

## secrets/CSFLE-example.pem

if you are using X509 authentication (recommended), put the client certificate/key PEM file here. 


