DEKCollection = "__localKeys";
DEKDB = "encryption";
DEKName = "CSFLE-DEK"
appDB = "data";
appCollection = "localQuestions";
secretsDir = "secrets";
atlasDir = "../atlas";
keyScriptFile = secretsDir + "/" + "keyScript.js";
mongoURIFile = atlasDir + "/" + secretsDir + "/" + "mongoURI.js";
load(mongoURIFile);