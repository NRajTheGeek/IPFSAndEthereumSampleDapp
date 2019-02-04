"use strict";

var express = require("express");
var router = express.Router();
var docService = require("../utils/docService");
var contractService = require("../utils/contractService");

var helper = require("../utils/helper");

router.post("/addPublisher", function(req, res, callback) {
  var publisherAddress = req.body.publisherAddress;
  var senderAddress = req.body.senderAddress;

  contractService.addPublisher(
    publisherAddress,
    senderAddress,
    res
  );
});

router.post("/addVerifier", function(req, res, callback) {
  var verifierAddress = req.body.verifierAddress;
  var senderAddress = req.body.senderAddress;

  contractService.addVerifier(
    verifierAddress,
    senderAddress,
    res
  );
});

router.get("/isPublisher/publisherAddress/:publisherAddress", function(req, res, callback) {
  var publisherAddress = req.params.publisherAddress;

  contractService.isPublisher(
    publisherAddress,
    res
  );
});

router.post("/uploadDocToBePublished", function(req, res, callback) {
  var documentBinary = req.body.document;
  var publisherAddress = req.body.publisherAddress;
  var ownerAddress = req.body.ownerAddress;

  docService.uploadDocumentToIPFS(
    documentBinary,
    publisherAddress,
    ownerAddress,
    res
  );
});

router.get("/generateRSAKeyPair/EthAddress/:EthAddress", async function(req, res, callback) {
  var EthAddress = req.params.EthAddress;
  await helper.generateAndPersistUserCredData(EthAddress, res);
});

router.post("/viewDoc/docHash/:docHash/CID/:CID", function(req, res, callback) {
  var docHash = req.params.docHash;
  var CID = req.params.CID;
  var RSAPrivateKeyPEM = req.body.rsaKeyPem;

  var viewerAddress = req.body.viewerAddress;

  docService.viewDocument(docHash, CID, viewerAddress, RSAPrivateKeyPEM, res);
});

router.get(
  "/queryDocByHash/docHash/:DocumentHash/requesterAddress/:requesterAddress",
  function(req, res, callback) {
    var requesterAddress = req.params.requesterAddress;
    var docHash = req.params.DocumentHash;

    docService.queryDocByHash(docHash, requesterAddress, res);
  }
);

router.post("/shareDocument", function(req, res, callback) {
  var docHash = req.body.documentHash;
  var CID = req.body.shareDocCID;
  var ownerAddress = req.body.ownerAddress;
  var addressToBeSharedWith = req.body.addressToBeSharedWith;

  var RSAPrivateKeyPEM = req.body.rsaKeyPem;

  docService.shareDocumentAccess(
    docHash,
    CID,
    ownerAddress,
    RSAPrivateKeyPEM,
    addressToBeSharedWith,
    res
  );
});

router.post("/sendDocumentForVerification", function(req, res, callback) {
  var docHash = req.body.docHash;
  var ownerAddress = req.body.ownerAddress;
  var publisherAddress = req.body.publisherAddress;
  var DocumentStatus = req.body.DocumentStatus;

  docService.sendDocumentForVerification(
    docHash,
    ownerAddress,
    publisherAddress,
    DocumentStatus,
    res
  );
});

router.post("/verifyDocument", function(req, res, callback) {
  var docHash = req.body.docHash;
  var verifierAddress = req.body.verifierAddress;
  var DocumentStatus = req.body.DocumentStatus;

  docService.verifyDocument(docHash, verifierAddress, DocumentStatus, res);
});

router.post("/rejectDocument", function(req, res, callback) {
  var docHash = req.body.docHash;
  var verifierAddress = req.body.verifierAddress;
  var DocumentStatus = req.body.DocumentStatus;

  docService.rejectDocument(docHash, verifierAddress, DocumentStatus, res);
});

module.exports = router;
