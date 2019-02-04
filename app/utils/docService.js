"use strict";

const ipfsClient = require("ipfs-http-client");
const NodeRSA = require("node-rsa");
const sha256 = require("js-sha256").sha256;

const helper = require("./helper.js");
const contractService = require("./contractService");
const UsersModel = require("../../models/users");
const docModel = require("../../models/documents");

// +++++++++++++++++++++++++++++++++++++ IPFS +++++++++++++++++++++++++++++++++++++
const ConnProtocol = "http";
const IPFSHost = "localhost";
const IPFSPort = "5001";

// connect to ipfs daemon API server
const ipfs = ipfsClient(IPFSHost, IPFSPort, { protocol: ConnProtocol });
const utils = require("util");
ipfs.addFromFs = utils.promisify(ipfs.addFromFs);
ipfs.add = utils.promisify(ipfs.add);
ipfs.get = utils.promisify(ipfs.get);
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

var uploadDocumentToIPFS = function(
  document,
  publisherAddress,
  ownerAddress,
  res
) {
  // 1. first fetch the user and the verifier by their names
  //    to basically capture their RSA public keys
  //    then encrypt the document binary in two folds
  // 2. calculate sha256 of the docuent binary
  // 3. encrypt with the public key of the publisher and then with symmetric key of the system
  //    put the hash_digest to the IPFS and get the CID of this document
  // 4. encrypt with the public key of the owner user and then with symmetric key of the system
  //    put the hash_digest to the IPFS and get the CID of this document
  // 5. put this doc hash and respective CID onto the documents model

  var sha256OfDoc = _getSHA256OfData(document);
  var collection = {};

  UsersModel.getUserByUserName(publisherAddress)
    .then(publisherDataOb => {
      let publisherRSAPublicKey = publisherDataOb.data;

      let encryptedByPublisher = _RSAEncryptData(
        document,
        publisherRSAPublicKey
      );

      return _publlishToIPFS(encryptedByPublisher);
    })
    .then(CIDByPublisher => {
      collection.CIDByPublisher = CIDByPublisher.data;
      return UsersModel.getUserByUserName(ownerAddress);
    })
    .then(userDataOb => {
      let userPubRSA = userDataOb.data;

      let encryptedByUser = _RSAEncryptData(document, userPubRSA);

      return _publlishToIPFS(encryptedByUser);
    })
    .then(CIDByUser => {
      collection.CIDByUser = CIDByUser.data;

      let docJSONModel = _BuildUpDocModel(
        sha256OfDoc,
        ownerAddress,
        collection.CIDByUser,
        publisherAddress,
        collection.CIDByPublisher
      );

      return helper.checkAndPersistDoc(sha256OfDoc, docJSONModel);
    })
    .then(savedDocRetOb => {
      res.send({
        saveresponse: savedDocRetOb.data,
        docHash: sha256OfDoc,
        CIDByPublisher: collection.CIDByPublisher,
        CIDByUser: collection.CIDByUser
      });
    })
    .catch(errOb => {
      console.log(errOb);

      res.send(errOb.err);
    });
};

var viewDocument = function(
  documentHash,
  CID,
  viewerUuid,
  RSAPrivateKeyPEM,
  res
) {
  // 1. check the details and access
  // 2. fetch data from the ipfs which will be encrypted by the symmetric key => public key
  // 3. decrypt symmetricaly
  // 4. decrypt by private key
  // 5. return the binary data

  var content = {};

  UsersModel.getUserByUserName(viewerUuid)
    .then(userDataOb => {
      var userData = userDataOb.data;
      content.privateKey = RSAPrivateKeyPEM;

      return docModel.getDocumentsByDocHash(documentHash);
    })
    .then(dataOb => {
      let docData = dataOb.data;

      if (_validateCIDForDocHash(docData, CID)) {
        content.docDataOb = docData;
        return _fetchFromIPFS(CID);
      } else {
        return res.send(new Error("doc does not exists"));
      }
    })
    .then(dataFromIPFS => {
      var DocFromIPFS = dataFromIPFS.data[0].content.toString();

      var decryptedDocBinary = _RSADecryptData(DocFromIPFS, RSAPrivateKeyPEM);

      res.send(decryptedDocBinary);
    })
    .catch(errOb => {
      console.log(errOb.err ? errOb.err : errOb);
      res.send(errOb.err ? errOb.err : errOb);
    });
};



var shareDocumentAccess = function(
  documentHash,
  CID,
  ownerAddress,
  RSAPrivateKeyPEM,
  addressToBeSharedWith,
  res
) {
  // 1. check the details of owner and docHash and CID and access to it of owner
  // 2. fetch data from the ipfs which will be decrypted by the symmetric key => private key
  // 3. decrypt symmetricaly
  // 4. decrypt by private key
  // 5. return the binary data

  var content = {};

  UsersModel.getUserByUserName(ownerAddress)
    .then(userDataOb => {
      var userData = userDataOb.data;

      return docModel.getDocumentsByDocHash(documentHash);
    })
    .then(dataOb => {
      let docData = dataOb.data;

      if (_validateCIDForDocHash(docData, CID)) {
        content.docDataOb = docData;
        return _fetchFromIPFS(CID);
      } else {
        return res.send(new Error("doc does not exists"));
      }
    })
    .then(dataFromIPFS => {
      var DocFromIPFS = dataFromIPFS.data[0].content.toString();

      var decryptedDocBinary = _RSADecryptData(
        DocFromIPFS,
        RSAPrivateKeyPEM
      );

      content.decryptedDocBinary = decryptedDocBinary;
      return UsersModel.getUserByUserName(addressToBeSharedWith);
    })
    .then(sharereDataOb => {
      let sharereData = sharereDataOb.data;

      let encryptedBySharer = _RSAEncryptData(
        content.decryptedDocBinary,
        sharereData.pubRSA
      );

      return _publlishToIPFS(encryptedBySharer);
    })
    .then(CIDBySharer => {
      content.CIDBySharer = CIDBySharer.data;

      content.sharedDocModel = _BuildShareDocModel(
        ownerAddress,
        addressToBeSharedWith,
        content.CIDBySharer,
        content.docDataOb
      );

      return docModel.getDocuments();
    })
    .then(allDocDataOb => {
      let allDoc = allDocDataOb.data;
      allDoc[documentHash] = content.sharedDocModel;
      return docModel.saveDocument(allDoc);
    })
    .then(resDataOb => {
      res.send({
        data: resDataOb.data
      });
    })
    .catch(errOb => {
      console.log(errOb.err ? errOb.err : errOb);
      res.send(errOb.err ? errOb.err : errOb);
    });
};


var sendDocumentForVerification = function(
  docHash,
  ownerAddress,
  publisherAddress,
  DocumentStatus,
  res
) {
  contractService
    .sendDocumentForVerification(
      docHash,
      ownerAddress,
      publisherAddress,
      DocumentStatus,
      res
    );
};

var verifyDocument = function(docHash, verifierAddress, DocumentStatus, res) {
  contractService
    .verifyDocument(docHash, verifierAddress, DocumentStatus, res);
};

var rejectDocument = function(docHash, verifierAddress, DocumentStatus, res) {
  var fcn = "update_document";
  var args = [];
  args.push(docHash);
  args.push(DocumentStatus);

  contractService
    .rejectDocument(docHash, verifierAddress, DocumentStatus, res);
};

var queryDocByHash = function(docHash, requesterAddress, res) {
  contractService
    .getDocumentByDocHash(docHash, requesterAddress, res);
};

// ==================================== Private Library ===============================================

var _BuildUpDocModel = function(
  docSHA256,
  ownerAddress,
  CIDByUser,
  publisherAddress,
  CIDByPublisher
) {
  let publisDetailArray = [];
  let publisherCIDObject = {};
  publisherCIDObject[CIDByPublisher] = {};
  publisherCIDObject[CIDByPublisher].publishedBy = publisherAddress;
  publisherCIDObject[CIDByPublisher].certOwner = ownerAddress;
  publisherCIDObject[CIDByPublisher].publicationDate = new Date();
  publisherCIDObject[CIDByPublisher].publicationDescription =
    "this is a digital pub";

  publisDetailArray.push(publisherCIDObject);

  let shareDetailArray = [];
  let userCIDObject = {};
  userCIDObject[CIDByUser] = {};
  userCIDObject[CIDByUser].sharedBy = ownerAddress;
  userCIDObject[CIDByUser].sharedWith = "";
  userCIDObject[CIDByUser].sharingDescription = "";

  shareDetailArray.push(userCIDObject);

  let docModel = {};

  docModel[docSHA256] = {};

  docModel[docSHA256].owner = ownerAddress;
  docModel[docSHA256].publishDetail = publisDetailArray;
  docModel[docSHA256].shareDetail = shareDetailArray;

  return docModel;
};

var _BuildShareDocModel = function(
  sharedFromId,
  shareredWithId,
  sharedDocCID,
  originalDocJSON
) {
  let newShareObject = {};
  newShareObject[sharedDocCID] = {};
  newShareObject[sharedDocCID].sharedBy = sharedFromId;
  newShareObject[sharedDocCID].sharedWith = shareredWithId;
  newShareObject[sharedDocCID].shareDiscription = "Nice Share";

  originalDocJSON.shareDetail.push(newShareObject);

  return originalDocJSON;
};

var _RSAEncryptData = function(plainTextDataBuffer, RSAPublicKey) {
  let key = new NodeRSA();
  var publicKey = key.importKey(RSAPublicKey, "pkcs8-public-pem");
  // let publicKey = key.importKey(RSAPublicKey, 'components-public');
  return publicKey.encrypt(plainTextDataBuffer, "base64", "utf8");
};

var _RSADecryptData = function(encryptedDataString, RSAPrivateKey) {
  let key = new NodeRSA();
  var privateKey = key.importKey(RSAPrivateKey, "pkcs8-private-pem");
  return privateKey.decrypt(encryptedDataString, "utf8");
};

var _getSHA256OfData = function(textData) {
  return sha256(textData);
};

var _publlishToIPFS = function(textualData) {
  var fileBuff = Buffer(textualData);

  return new Promise((resolve, reject) => {
    ipfs
      .add(fileBuff)
      .then(result => {
        let dataUploaded = result[0].hash;

        resolve({
          err: null,
          data: dataUploaded
        });
      })
      .catch(err => {
        console.log(err);
        reject({
          err: err,
          data: null
        });
      });
  });
};

var _fetchFromIPFS = function(CID) {
  return new Promise((resolve, reject) => {
    ipfs
      .get(CID)
      .then(files => {
        resolve({
          err: null,
          data: files
        });
      })
      .catch(err => {
        console.log(err);
        reject({
          err: err,
          data: null
        });
      });
  });
};

var _validateCIDForDocHash = function(docDataObject, CID) {
  if (_checkObjectKeyInArray(docDataObject.publishDetail, CID)) {
    return true;
  } else if (_checkObjectKeyInArray(docDataObject.shareDetail, CID)) {
    return true;
  } else {
    return false;
  }
};
var _checkObjectKeyInArray = function(objectArray, key) {
  for (let i = 0; i < objectArray.length; i++) {
    if (objectArray[i][key]) {
      return true;
    }
  }
  return false;
};

//=====================================================================================================

module.exports = {
  uploadDocumentToIPFS,
  viewDocument,
  sendDocumentForVerification,
  verifyDocument,
  rejectDocument,
  queryDocByHash,
  shareDocumentAccess
};
