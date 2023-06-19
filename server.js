const express = require("express");
const AWS = require("aws-sdk");
const fs = require("fs");
const forge = require("node-forge");

function convertPemToRsa(pemPrivateKey) {
    const privateKeyPem = pemPrivateKey.toString();
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const privateKeyRsaPem = forge.pki.privateKeyToPem(privateKey, 64);
    return privateKeyRsaPem;
}

const pemPrivateKey = fs.readFileSync("./private_key.pem");
const rsaPrivateKey = convertPemToRsa(pemPrivateKey);

const app = express();
const PORT = 4000;

function createSignedURL() {
    const signer = new AWS.CloudFront.Signer("KWNFQ4ZI31UX", rsaPrivateKey);

    const time = Date.now();
    const expireInSeconds = 300; // 5 minutes
    const expireTime = Math.floor(time / 1000) + expireInSeconds;

    const url = signer.getSignedUrl({
        url: "https://d2nqaikk7t8995.cloudfront.net/test.png",
        expires: expireTime,
    });

    console.log("Signed URL:", {
        url,
    });

    return url;
}

app.get("/", (req, res) => {
    const url = createSignedURL();
    res.send(
        `Signed URL generated. <a href="${url}" target="_blank">Signed Link</a>`
    );
});

app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
});
