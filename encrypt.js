const { MongoClient, Binary } = require("mongodb");
const { ClientEncryption } = require("mongodb-client-encryption");
const fs = require("fs/promises");
require('dotenv').config();

console.log(process.env.ATLAS_URI);

async function getRegularClient() {
  const client = new MongoClient(process.env.ATLAS_URI);
  return await client.connect();
}

async function getCsfleEnabledClient(schemaMap) {
  const client = new MongoClient(process.env.ATLAS_URI, {
    autoEncryption: {
      keyVaultNamespace: "encryption.__keyVault",
      kmsProviders: {
        local: {
          key: await fs.readFile("./master-key.txt"),
        },
      },
      schemaMap,
    },
  });
  return await client.connect();
}

function createJsonSchemaMap(dataKey) {
  return {
    "users.ssns": {
        bsonType: "object",
        encryptMetadata: {
          keyId: [new Binary(Buffer.from(dataKey, "base64"), 4)],
        },
        properties: {
          insurance: {
            bsonType: "object",
            properties: {
              policyNumber: {
                encrypt: {
                  bsonType: "int",
                  algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
                },
              },
            },
          },
          medicalRecords: {
            encrypt: {
              bsonType: "array",
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
            },
          },
          bloodType: {
            encrypt: {
              bsonType: "string",
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
            },
          },
          ssn: {
            encrypt: {
              bsonType: "int",
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
            },
          },
        },
    },
  };
}

async function makeDataKey(client) {
  const encryption = new ClientEncryption(client, {
    keyVaultNamespace: "encryption.__keyVault",
    kmsProviders: {
      local: {
        key: await fs.readFile("./master-key.txt"),
      },
    },
  });

  let dataKey = await encryption.createDataKey("local", {
    masterKey: null,
  });

  return dataKey.toString("base64");
}

async function run(regularClient, csfleClient) {
  try {

    regularClient = await getRegularClient();

    let dataKey = await makeDataKey(regularClient);
    console.log(
      "New dataKey created for this run:\n",
      dataKey
    );

    const schemaMap = createJsonSchemaMap(dataKey);

    csfleClient = await getCsfleEnabledClient(schemaMap);

    const regularClientSsnsColl = regularClient
      .db("users")
      .collection("ssns");
    const csfleClientSsnsColl = csfleClient
      .db("users")
      .collection("ssns");

    const exampleDocument = {
        name: "Jon Doe",
        ssn: 241014209,
        bloodType: "AB+",
        "key-id": "demo-data-key",
        medicalRecords: [{ weight: 180, bloodPressure: "120/80" }],
        insurance: {
          policyNumber: 123142,
          provider: "MaestCare",
        },
      };

    await csfleClientSsnsColl.updateOne(
      { ssn: exampleDocument.ssn },
      { $set: exampleDocument },
      { upsert: true }
    );

    const csfleFindResult = await csfleClientSsnsColl.findOne({
      ssn: exampleDocument.ssn,
    });
    console.log(
      "Document retrieved with csfle enabled client:\n",
      csfleFindResult
    );

    const regularFindResult = await regularClientSsnsColl.findOne({
      name: "Jon Doe",
    });
    console.log(
      "Document retrieved with regular client:\n",
      regularFindResult
    );

  } finally {
    if (regularClient) await regularClient.close();
    if (csfleClient) await csfleClient.close();
  }
}

run().catch(error => {
  console.dir(error);
  process.exit(1);
});