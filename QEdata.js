doc = {
  t1: {
    A: "TEST",
    B: [
      {
        B1: "TEST",
        B2: "TEST",
      },
      {
        B1: "TEST",
        B2: "TEST",
      },
    ],
  },
};

doc1map = {// Not Working
  keyId: null,
  path: "t1.B.B1",
  bsonType: "string", 
};

doc2map = { // Working
  keyId: null,
  path: "t1.A",
  bsonType: "string",
  queries: {
    queryType: "equality" 
  },
};