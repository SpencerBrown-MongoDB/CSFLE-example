BsonDocument doc1 = new BsonDocument()
				.append("keyId", new BsonNull()))
				.append("path", new BsonString("t1.B.B1"))
				.append("bsonType", new BsonString("string")); // Not Working

BsonDocument doc2 = new BsonDocument()
				.append("keyId", new BsonNull())
				.append("path", new BsonString("t1.A")) // Working properly
				.append("bsonType", new BsonString("string"))
				.append("queries", new BsonDocument().append("queryType", new BsonString("equality")));`