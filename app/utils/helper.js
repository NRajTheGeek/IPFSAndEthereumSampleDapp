"use strict";

var userModel = require("../../models/users");
var docModel = require("../../models/documents");
const NodeRSA = require('node-rsa');

var generateRSAKeyPair = function() {
  return new Promise((resolve, reject) => {
    var key = new NodeRSA();
    // 512 bit RSA key is more than enough for this demo
    key.generateKeyPair(512);

    var pub_k = key.exportKey("pkcs8-public-pem");
    var pri_k = key.exportKey("pkcs8-private-pem");

    var keyPair = {
      RSAPrivateKey: pri_k,
      RSAPublicKey: pub_k
    };
    console.log(keyPair);
    
    resolve({
      err: null,
      data: keyPair
    });
  });
};

var generateAndPersistUserCredData = async function(EthAddress, res) {
  var userRSAKeys = {};
  console.log('came here');
  
  generateRSAKeyPair()
    .then(keyPair => {
      var pub_k = keyPair.data.RSAPublicKey;
      var pri_k = keyPair.data.RSAPrivateKey;

      userRSAKeys.rsaPublicKey = pub_k;
      userRSAKeys.RSAPrivateKey = pri_k;
      
      return checkAndPersistUser(EthAddress, userRSAKeys.rsaPublicKey);
    })
    .then(result => {
      console.log(result);
      res.send(userRSAKeys);
    })
    .catch(errOb => {
      console.log(
        "Failed to get public key from keystore of user: " +
          EthAddress +
          " error: " +
          errOb.err
      );
      res.send(errOb);
    });
};

var checkAndPersistUser = function(ownerAddress, userKey) {
  return new Promise((resolve, reject) => {
    userModel.getUserByUserName(ownerAddress).then(async userDetail => {
      if (userDetail.data) {
        resolve({
          err: null,
          data: "user already saved"
        });
      } else {
        var users = await userModel.getUsers();
        users.data[ownerAddress] = userKey;
        let ret = await userModel.saveUser(users.data);

        resolve({
          err: null,
          data: ret.data
        });
      }
    });
  });
};

var checkAndPersistDoc = function(docHash, docJSON) {
  return new Promise((resolve, reject) => {
    docModel.getDocumentsByDocHash(docHash).then(async docDetail => {
      if (docDetail.data) {
        resolve({
          err: null,
          data: "doc already saved"
        });
      } else {
        var docs = await docModel.getDocuments();
        docs.data[docHash] = docJSON[docHash];
        let ret = await docModel.saveDocument(docs.data);

        resolve({
          err: null,
          data: ret.data
        });
      }
    });
  });
};

module.exports = {
  generateAndPersistUserCredData,
  generateRSAKeyPair,
  checkAndPersistUser,
  checkAndPersistDoc
};
