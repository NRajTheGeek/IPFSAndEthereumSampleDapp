const Web3 = require("web3");
const contract = require("truffle-contract");
const path = require("path");
const fs = require("fs");

let KYCContractABI = require(path.join(
  __dirname,
  "../../build/contracts/KYC.json"
));

let provider = new Web3.providers.HttpProvider("http://localhost:8545");

let KYCContract = contract(KYCContractABI);
KYCContract.setProvider(provider);

const addVerifier = function(verifierAddress, senderAddress, res) {
  KYCContract.deployed()
    .then(function(instance) {
      return instance.addVerifier(verifierAddress, {
        from: senderAddress
      });
    })
    .then(function(result) {
      console.log("successfully added verifier");
      res.send(result);
    })
    .catch(function(error) {
      console.log(error);
      res.send(error);
    });
};

const addPublisher = function(publisherAddress, senderAddress, res) {
  KYCContract.deployed()
    .then(function(instance) {
      return instance.addPublisher(publisherAddress, {
        from: senderAddress
      });
    })
    .then(result => {
      console.log("successfully added publisher");
      res.send(result);
    })
    .catch(function(error) {
      console.log(error);
      res.send(error);
    });
};

const isPublisher = function(publisherAddress, senderAddress, res) {
  KYCContract.deployed()
    .then(function(instance) {
      return instance.publishers.call(publisherAddress, senderAddress);
    })
    .then(result => {
      console.log(result);
      res.send(result);
    })
    .catch(function(error) {
      console.log(error);
      res.send(error);
    });
};

const sendDocumentForVerification = function(
  docHash,
  ownerAddress,
  publisherAddress,
  DocumentStatus,
  res
) {
  KYCContract.deployed()
    .then(function(instance) {
      return instance.sendDocForVerification(
        docHash,
        DocumentStatus,
        ownerAddress,
        {
          from: publisherAddress,
          gas: 3000000
        }
      );
    })
    .then(result => {
      console.log("document sent for verification");
      res.send(result);
    })
    .catch(function(error) {
      console.log(error);
      res.send(error);
    });
};

const verifyDocument = function(docHash, verifierAddress, DocumentStatus, res) {
  KYCContract.deployed()
    .then(function(instance) {
      return instance.verifyDocument(docHash, DocumentStatus, {
        from: verifierAddress
      });
    })
    .then(result => {
      console.log("document sent for verification");
      res.send(result);
    })
    .catch(function(error) {
      console.log(error);
      res.send(error);
    });
};

const rejectDocument = function(docHash, verifierAddress, DocumentStatus, res) {
  KYCContract.deployed()
    .then(function(instance) {
      return instance.rejectDocument(docHash, DocumentStatus, {
        from: verifierAddress
      });
    })
    .then(result => {
      console.log("document sent for verification");
      res.send(result);
    })
    .catch(function(error) {
      console.log(error);
      res.send(error);
    });
};

const getDocumentByDocHash = function(docHash, requesterAddress, res) {
  KYCContract.deployed()
    .then(function(instance) {
      return instance.getDocByHash(docHash, {
        from: requesterAddress
      });
    })
    .then(result => {
      console.log("document sent for verification");
      var response = {
        docHash: docHash,
        ownerAddress: result[0],
        publisherAddress: result[1],
        docStatus: result[2],
        createdOn: result[3],
        modifiedOn: result[4]
      }
      res.send(response);
    })
    .catch(function(error) {
      console.log(error);
      res.send(error);
    });
};

module.exports = {
  sendDocumentForVerification,
  addVerifier,
  addPublisher,
  isPublisher,
  verifyDocument,
  rejectDocument,
  getDocumentByDocHash
};
