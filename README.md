# IPFSEthereumSample_DApp

* _Pre-requisites:_
  * Docker version 18.09.0+
  * docker-compose version 1.23.0+ 
  * Node.js v8.5+
  * Truffle v4.1.10+
  * IDE of Your choice (preferred is VsCode)

### Index
1. Introduction
2. Smart Contract Hosting Blockchain Network Architecture
3. The Flow and Idea 
4. KYC Smart Contract
5. Understandng the network setup of the IPFS private cluster
6. Steps to start the IPFS cluster
7. Steps to start the Ganache-CLI
8. Steps to Deploy the Smart Contracts for the KYC Dapp
9. Steps to start the server
10. Swagger for UI based interaction with the server
11. Conclusion and what next?


## 1. Introduction:- 
Its a simple dapp demo over `Ethereum Blockchain with Ganache-cli`, and smart contracts written in `Solidity 0.4.17` and handles deployments with `truffle smart contract deployment/development framework` and it has a `NodeJS server` to serve the APIs for feature interactions with the smart contract and it has a `Swagger UI` to provide UI interface / Documentation.
Its a Simple KYC demo app utilizing an EVM underneath to host solidity smart contract for the purpose, one can easily utilize any platform built ontop of EVM to host these smart contract and have the Dapp running by following the steps.

## 2. Smart Contract Hosting Blockchain Network Architecture:-
There is a test rpc node running with the ganache-cli, which gives the deployment of the smart contract in the dev mode making it fast and easy deployments as per the requirement of the development of the system.

One should only need to install ganache-cli with the npm 
```
npm install ganache-cli -g
```
and then just need to run by

```
ganache-cli -l 80000000000
```
giving the gas limit by '-l 80000000000' to attain a gas limit of 80000000000 much.

Currently there is simply one node deployment for the network architecture, this depends on the business use case and the need for the selection of the network architecture.

## 3. The Flow and Idea

*The KYC DApp:*
Our Sample Dapp basically utilizes, 

The basic ides of this POC was to have a KYC dapp running over the ethereum network, and for having the datastore of the KYC document over a private IPFS cluster.

The Dapp is hosted over the ganche-cli which utilizes a test rpc node, but the dapp can also be very easy be hsted over the other EVm platforms such as Quorum etc.
This dapp is public by nature of hosting over the ethereum as its idea is also pubic dapp.

Migration of its Smart Contract is the simplest:
```
var KYC = artifacts.require("./KYC.sol");

module.exports = function(deployer) {
  deployer.deploy(KYC);
};
```
So let's dive into the detailed idea of the Dapp. Let's consider first the interaction steps for the KYC:
1. Generate the RSA key pair for the Ethereum account address by the user itself to be authorized onto the network. After recieving the RSA key pair user must store his private key pem some where safe.

API endpoint (GET METHOD):

*{{URL}}/uploadDocToBePublished*

2. Upload the KYC Document. Basically a publisher(a kyc merchant) will upload/publish a digital imprint of the document of the user over to the network, which will be taken care by the IPFS private cluster.

API end point (POST method):

*{{URL}}/uploadDocToBePublished*

Sample upload call json body:
```
{
	"document": <"base 64 of the docuemnt, generally JPEG">,
        "publisherAddress": <"publisher's ethereum account address">,
	"ownerAddress": <"ethereum account address of who is applying the KYC"?
}
```
3. send the docuemnt for the verification this will do the first dapp transaction as submitting the document sha256 hash with the status '1' being uloaded status.

API endpoint (POST  method):
*{{URL}}/sendDocumentForVerification*

the request body:

```
{
	"docHash": <"sha256 hash digest of the docuemnt">,
	"publisherAddress": <"authorized publisher's ethereum address">,
	"ownerAddress": <"authorized owner's ethereum address">,
	"DocumentStatus": "1"
}
```
which will send the doc for verification.

4. share the doc with the verifier account so it can be viewd and then verified by the verifier

API endpoint (POST method):
*{{URL}}/shareDocument*

the request body:
```
{
	"docHash": <"sha256 hash digest of the docuemnt">,
        "shareDocCID": <"CID hash of the doc returned by the doc upload">,
	"ownerAddress": <"authorized owner's ethereum address">,
	"addressToBeSharedWith": <"authorized verifier's ethereum address">
}
```
now the CID will be shared  with the verifier.

#### Verifier's interaction steps:
1. Generate the RSA key pair for the Ethereum account address by the verifier itself to be authorized onto the network. After recieving the RSA key pair user must store his private key pem some where safe.

API endpoint (GET METHOD):

*{{URL}}/uploadDocToBePublished*

##### The key assumption:
the app that will cater this dapp will have the documents sha256 signature registered onto it, from where these can be fetched and have a doc verified by the docHash after viewing the doc
2. as the doc is sared with the verifier 

API end point (POST method):

*{{URL}}/uploadDocToBePublished*

Sample upload call json body:
```
{
	"document": <"base 64 of the docuemnt, generally JPEG">,
        "publisherAddress": <"publisher's ethereum account address">,
	"ownerAddress": <"ethereum account address of who is applying the KYC"?
}
```

## 4. Smart Contract

#### For NodeB

```


```
## 5. 

## 6. 



## 7. Steps to Deploy the Smart Contracts for the Bidder Dapp

*Bofore moving forward install truffle globaly with npm.*
```
npm install truffle -g
```
Now, there are two smart contracts in the contracts directory:
```
contracts
   Migrations.sol
   KYC.sol
```
which are displayed above at the 4th index [smart contracts].

lets have a look on our *truffle.json file*
```

module.exports = {
  networks: {
    develop: {
      host: '127.0.0.1',
      port: 8545, 
      network_id: '*',
      gasPrice: 0,
      gas: 4500000
    }
}

```

Now to deploy these using truffle framework first do a compile from the project root directory
```
truffle compile
```
And now you can deploy the smart contracts from project root directory

```
truffle compile --network nodeA
```

you should see output similar to
```
Using network 'nodeA'.
Running migration: 1_initial_migration.js
  Deploying Migrations...
  ... 0x54ca617b5e50e43c8af181a03de5e201f9f6eea1fe60df6657dddd546e7d98f9
  Migrations: 0xa4687bcf6b1ed073d5c6ca779822464af624dc4b
Saving successful migration to network...
  ... 0xe9581fa10e240489ca40d5ed0ff524e9643344f965dd87faf41ea920437a3767
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Deploying KYC...
  ... 0x20535728e225a564573f12e0221b753ef65a4db1c9be686e55977a2d944bd199
  KYC: 0x8bde762767b1f4b6686f706f4a4c8a53de264966
Saving successful migration to network...
  ... 0xe5dcda7b247d0196d4b2c1891eeb1c7aeee38ea81afcdc40cb397915a79bb713
Saving artifacts...
```
with obviously contract addresses and tx hashes changed.
Now you can launch the Node JS server.

## 8. Steps to start the server

From Project root directory
```
npm start 
```
Now the server has started, aps can be accessed at localhost on port 3000.

## 9. Swagger for interaction with the server

To interact with the APIs there is a Swagger UI hosted which dobles as a clean documentation for this server's APIs.

Go to the following link at your browser.

```
localhost:3000/swagger
```

   
   #### Note: The use case of the Quorum protocol allow us to hide the bid of nodeB user from nodeC user, using the txManagers.
   

## 10. Conclusion



##  What's next?

If You have Ideas of improvement please email me at:

rajputneerajkumar815@gmail.com
