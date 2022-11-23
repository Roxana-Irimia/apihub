require("../../../../psknode/bundles/testsRuntime");
const dc = require("double-check");
const assert = dc.assert;
const path = require("path");
const fs = require("fs");
const config = require("../../config");
const serverRootFolder = "../../../../../apihub-root"
const crypto = require("opendsu").loadAPI("crypto");
const secretsFolderPath = path.join(serverRootFolder, config.getConfig("externalStorage"), "secrets");
const demiurgeSecretsFilePath = path.join(secretsFolderPath, "Demiurge.secret");
const env = require("../../../../../env.json");
const encryptedSecrets = fs.readFileSync(demiurgeSecretsFilePath);
let encryptionKey = env.SSO_SECRETS_ENCRYPTION_KEY.split(",")[0];
encryptionKey = $$.Buffer.from(encryptionKey, "base64");
let decryptedSecrets;
let error;
try {
    decryptedSecrets = crypto.decrypt(encryptedSecrets, encryptionKey);
} catch (e) {
    error = e;
}

assert.equal(error, undefined, "Error should be undefined");
assert.true(decryptedSecrets !== undefined);

