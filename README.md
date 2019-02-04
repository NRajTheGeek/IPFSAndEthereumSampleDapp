# IPFSEthereumSample_DApp

* _Pre-requisites:_
  * Docker version 18.09.0+
  * docker-compose version 1.23.0+ 
  * Node.js v8.5+
  * ganache-cli [Ganache CLI v6.3.0 (ganache-core: 2.4.0)]
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
11. what next?


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

response:

```
{
    "message": "document updated successfully",
    "data": {
        "SharedCID": [
            "QmZA4r7URrTPoJvNJB2aLXyarQ9wsGCLUsj7rhmZiRi98W"
        ],
        "shareDetails": {
            "QmZA4r7URrTPoJvNJB2aLXyarQ9wsGCLUsj7rhmZiRi98W": {
                "sharedBy": "0x7c9dd2097ac4ff1681151554d7c2c582a6b3cf41",
                "sharedWith": "0xd304d425f178f560626531a928ecf83fa63d74b1",
                "shareDiscription": "Nice Share"
            }
        }
    }
}
```

now the CID will be shared  with the verifier. the verifier will be repoterd by some fancy notification system of the client app to have this CID of the shared doc using which the verifier can then view the doc.


#### Verifier's interaction steps:
##### 1. Generate the RSA key pair for the Ethereum account address by the verifier itself to be authorized onto the network. After recieving the RSA key pair user must store his private key pem some where safe.

API endpoint (GET METHOD):

*{{URL}}/uploadDocToBePublished*

###### The key assumption:

The app that will cater this dapp will have the documents sha256 signature registered onto it, from where these can be fetched and have a doc verified by the verifier using the docHash after viewing the doc

##### 2. API end point (POST method) to view the doc (will give back the base64 of the doc) 

*{{URL}}/viewDoc/docHash/<docHash>/CID/<CID returned by the upload API>*

Sample view doc json body:
```
{
	"rsaKeyPem": "-----BEGIN PRIVATE KEY-----\nMIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEAjPvQJenBUz+g1SJT\nN1BjUmZFuMaNHk/kJnN/yw/yoPYjW9WnLLB4LizaRWX61Zjpy5N1nUXXvBv3KKHS\nK45RKwIDAQABAkAF9x2ujP5+HEIc4o/s1jztnqAymkwcTTsVGWv91pXok5F/Wwm/\n07+TCOE8bwLmDF2AVFYPPAWRRinwiLDT9545AiEAyNprk3xsqvK7hgCs0t8BtofP\nvwDxgutmBg8PhnKF+X8CIQCzsUdDVmSJrMSrBOh8Jwib+35wNghfCQzLRu8ilIaG\nVQIgb83t7hZn4yzlJ+2+Rk+vA21MPlWHGspwa1T83mlnnH8CICPjVylCuueoQssp\nOsl4/kYw72q3z+ozI4QB0cblRQzVAiEAo08DbgPzvaV580zlq4tAVLi5ko7+r1kV\nXFxyEKuLe7M=\n-----END PRIVATE KEY-----",
	"verifierAddress": "0xd304d425f178f560626531a928ecf83fa63d74b1"
}
```
After viewing the doc (currently doc view is a manual method but one can develop an OCR to verify the doc). After the viewing doc can be verified or rejected.

##### 3(i). Verify the doc

API end point (POST method)

*{{URL}}/verifyDocument*

the sample request json 

```
{
	"docHash": "c57f487c48da444940bcc36044c0c8b12bb03c0dce641c6178bb4f2556ca73c0",
	"verifierAddress": "0xd304d425f178f560626531a928ecf83fa63d74b1",
	"DocumentStatus": "2"
}
```
this way using the address of the verifier the doc hash given can be setted as the status of 2 call it verified with obviously this ethereum account needed to be unlocked first (we dont need as we are using test rpc having accounts unlocked already).

##### 3(ii). Reject the doc

API end point (POST method)

*{{URL}}/rejectDocument*

the sample request json 

```
{
	"docHash": "c57f487c48da444940bcc36044c0c8b12bb03c0dce641c6178bb4f2556ca73c0",
	"verifierAddress": "0xd304d425f178f560626531a928ecf83fa63d74b1",
	"DocumentStatus": "3"
}
```
this way using the address of the verifier the doc hash given can be setted as the status of 3 call it rejected with obviously this ethereum account needed to be unlocked first (we dont need as we are using test rpc having accounts unlocked already).

##### key assumption
i).Once send for verification the same digital copy can never be sent for verification again.

ii). Oncce verified cant be rejected and vice-versa

## 4. Smart Contract

#### utils.sol Smart Contract

```
pragma solidity ^0.4.17;

contract Utils {
    uint _INACTIVE = 0;
    uint _PENDING = 1;
    uint _VERIFIED = 2;
    uint _REJECTED = 3;
    address owner;

    struct Document {
        address docOwner;
        address publisher;
        uint verificationStatus;
        uint createdOn;
        uint modifiedOn;
        bool upload;
    }

    mapping (address => bool) public verifiers;
    mapping (address => bool) public publishers;
    //    sha256_hashDigest => document
    mapping (string => Document) KYCDoc;


    modifier onlyOwner(address _owner) 
    {
        require(_owner == owner, "cannot perform action.");
        _;
    }

    modifier onlyActiveVerifier(address _verifier) 
    {
        require(verifiers[_verifier] == true, "not an active verifer.");
        _;
    }

    modifier onlyActivePublisher(address _publisher) 
    {
        require(publishers[_publisher] == true, "not an active publisher.");
        _;
    }

    modifier addressNotBlank(address add)
    {
        require(add != address(0), "null address");
        _;
    }

    modifier nullStringCheck(string memory val)
    {
        require(bytes(val).length > 0, "empty string");
        _;
    }

    modifier uintNonZero (uint val) 
    {
        require(val > 0, "cannot be zero");
        _;
    }
    
    
    modifier alreadyVerifier (address _toBeSet) 
    {
        bool toCheck = verifiers[_toBeSet];
        require(!toCheck, "already added");
        _;
    }
    
    modifier alreadyPublisher (address _toBeSet) 
    {
        bool toCheck = publishers[_toBeSet];
        require(!toCheck, "already added");
        _;
    }
    
    modifier alreadySentForVeirifcation (string memory _docHash)
    {
        Document memory document = KYCDoc[_docHash];
        require(document.verificationStatus == _INACTIVE, "Error! already sent for verification.");
        _;
    }
    
    modifier alreadyVerified (string memory _docHash)
    {
        Document memory document = KYCDoc[_docHash];
        require(document.verificationStatus != _VERIFIED, "Error! already verified.");
        _;
    } 
    
    modifier alreadyRejected (string memory _docHash)
    {
        Document memory document = KYCDoc[_docHash];
        require(document.verificationStatus != _REJECTED, "Error! already rejected.");
        _;
    }
    
    modifier maybeRejected (string memory _docHash)
    {
        Document memory document = KYCDoc[_docHash];
        require(document.verificationStatus != _REJECTED, "Error! already rejected.");
        _;
    }
    
    modifier mustBePending (uint status) {
        require(status == _PENDING, "Error! only pending status allowed.");
        _;
    }
    
    modifier mustBeVerified (uint status) 
    {
        require(status == _VERIFIED, "Error! only verified status allowed.");
        _;
    }
    
    modifier mustBeRejected (uint status) 
    {
        require(status == _REJECTED, "Error! only rejected status allowed.");
        _;
    }
}

```
#### KYC.sol Smart contract
```
pragma solidity ^0.4.17;

import "./utils.sol";

contract KYC is Utils{
    
    constructor() public {
        owner = msg.sender;
    }   
    
    function() external payable {
        revert();
    } 
    
    function addVerifier(address _verifier) 
    public 
    onlyOwner(msg.sender)
    addressNotBlank(_verifier) 
    alreadyVerifier(_verifier) 
    {
        verifiers[_verifier] = true;
    } 

    function addPublisher(address _publisher) 
    public 
    onlyOwner(msg.sender)
    addressNotBlank(_publisher) 
    alreadyPublisher(_publisher) 
    {
        publishers[_publisher] = true;
    }

    function sendDocForVerification (string memory _docHash, uint _docStatus, address _docOwner)  
    public
    onlyActivePublisher(msg.sender)
    nullStringCheck(_docHash)
    addressNotBlank(_docOwner)
    mustBePending(_docStatus) 
    alreadySentForVeirifcation(_docHash)
    {
        Document memory document = Document(_docOwner, msg.sender, _docStatus, now, now, true);  
        KYCDoc[_docHash] = document; 
    } 
    
    function verifyDocument (string memory _docHash, uint _docStatus) 
    public
    onlyActiveVerifier(msg.sender)
    nullStringCheck(_docHash)
    mustBeVerified(_docStatus)
    alreadyVerified(_docHash)
    maybeRejected(_docHash)
    {
        Document memory document = KYCDoc[_docHash];
        if(document.upload){
            document.verificationStatus = _docStatus;
            document.modifiedOn = now;
            KYCDoc[_docHash] = document;
        } else { 
            revert("document doesn't exists");
        }
    } 
    
    function rejectDocument (string memory _docHash, uint _docStatus) 
    public
    onlyActiveVerifier(msg.sender)
    nullStringCheck(_docHash)
    mustBeRejected(_docStatus)
    alreadyRejected(_docHash)
    alreadyVerified(_docHash)
    {
        Document memory document = KYCDoc[_docHash];
        if(document.upload){
            document.verificationStatus = _docStatus;
            document.modifiedOn = now;
            KYCDoc[_docHash] = document;
        } else {
            revert("document doesn't exists"); 
        }
        
    }
    
    function getDocByHash (string memory _docHash) 
    public
    view
    nullStringCheck(_docHash)
    returns (address owner, address publisher, uint status, uint createdOn, uint modifiedOn)
    {
        Document memory doc = KYCDoc[_docHash];
        if(doc.upload){
            return (doc.docOwner, doc.publisher, doc.verificationStatus, doc.createdOn, doc.modifiedOn);
        } else {
            revert("document doesn't exists");
        }
    }
    
}
```

#### Migrations.sol

```
pragma solidity ^0.4.17;

contract Migrations {
  address public owner;
  uint public last_completed_migration;

  modifier restricted() {
    if (msg.sender == owner) _;
  }

  constructor () public {
    owner = msg.sender;
  }

  function setCompleted(uint completed) public restricted {
    last_completed_migration = completed;
  }

  function upgrade(address new_address) public restricted {
    Migrations upgraded = Migrations(new_address);
    upgraded.setCompleted(last_completed_migration);
  }
}

```
## 5. Understandng the network setup of the IPFS private cluster

The architecture is quite straight forward as we are having a private cluster of the IPFS, we need to have IPFS deamon (IPFS node) and the cluster node for managing the interaction with the IPFS deamon in private network.

for this we are having 

i).  2 IPFS node Deamons 
ii). 2 IPFS cluster containers

```
version: '3.4'

# This is a docker-compose file for IPFS Cluster
# It runs two Cluster peers (cluster0, cluster1) attached to two
# IPFS daemons (ipfs0, ipfs1).
#
# It expects a "compose" subfolder as follows where it will store configurations
# and states permanently:
#
# compose/
# |-- cluster0
# |-- cluster1
# |-- ipfs0
# |-- ipfs1
#
# 
# During the first start, default configurations are created for all peers.

services:
##################################################################################
## Cluster PEER 0 ################################################################
##################################################################################

  ipfs0:
    container_name: ipfs0
    image: ipfs/go-ipfs:release
    ports:
          - "4001:4001" # ipfs swarm
          - "5001:5001" # expose if needed/wanted
          - "8080:8080" # exposes if needed/wanted
    volumes:
      - ./compose/ipfs0:/data/ipfs
      
  cluster0:
    container_name: cluster0
    image: ipfs/ipfs-cluster:latest
    depends_on:
      - ipfs0
    environment:
      CLUSTER_SECRET: ${CLUSTER_SECRET} # From shell variable
      IPFS_API: /dns4/ipfs0/tcp/5001
    ports:
          - "127.0.0.1:9094:9094" # API
          - "9096:9096" # Cluster IPFS Proxy endpoint
    volumes:
      - ./compose/cluster0:/data/ipfs-cluster

##################################################################################
## Cluster PEER 1 ################################################################
##################################################################################
      
  ipfs1:
    container_name: ipfs1
    image: ipfs/go-ipfs:release
    ports:
          - "4101:4001" # ipfs swarm
          - "5101:5001" # expose if needed/wanted
          - "8180:8080" # exposes if needed/wanted
    volumes:
      - ./compose/ipfs1:/data/ipfs

  # cluster1 bootstraps to cluster0 if not bootstrapped before
  cluster1:
    container_name: cluster1
    image: ipfs/ipfs-cluster:latest
    depends_on:
      - cluster0
      - ipfs1
    environment:
      CLUSTER_SECRET: ${CLUSTER_SECRET} # From shell variable
      IPFS_API: /dns4/ipfs1/tcp/5001
    ports:
          - "127.0.0.1:9194:9094" # API
          - "9196:9096" # Cluster IPFS Proxy endpoint
    volumes:
      - ./compose/cluster1:/data/ipfs-cluster
    entrypoint:
      - "/sbin/tini"
      - "--"
    # Translation: if state folder does not exist, find cluster0 id and bootstrap
    # to it.
    command: >-
      sh -c '
        cmd="daemon --upgrade"
        if [ ! -d /data/ipfs-cluster/raft ]; then
          while ! ipfs-cluster-ctl --host /dns4/cluster0/tcp/9094 id; do
            sleep 1
          done
          pid=`ipfs-cluster-ctl --host /dns4/cluster0/tcp/9094 id | grep -o -E "^(\w+)"`
          sleep 10
          cmd="daemon --bootstrap /dns4/cluster0/tcp/9096/ipfs/$$pid"
        fi
        exec /usr/local/bin/entrypoint.sh $$cmd
      '

```

This is a simple docker-container compose file and this will store the data onto the local hard drive.

## 6. Steps to start the IPFS cluster

to start the data store over the IPFS do the following 

```
cd <project root>
cd IPFS

docker-compose up -d
```
this will launch the IPFS deamon as well as ther cluster conatiners. and you are good to go.
##### Note: before uploading any data onto the server bringing up these docker-containers in important.


## 7. Steps to start the Ganache-CLI

```
ganache-cli -l 80000000
```

## 8. Steps to Deploy the Smart Contracts for the KYC Dapp

*Bofore moving forward install truffle globaly with npm.*
```
npm install truffle -g
```
Now, there are three smart contracts in the contracts directory:
```
contracts
   Migrations.sol
   KYC.sol
   utils.sol
```
which are displayed above in the [smart contracts].

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
truffle compile --network develop
```

you should see output similar to
```
Using network 'develop'.
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

## 9. Steps to start the server

From Project root directory
```
npm start 
```
Now the server has started, aps can be accessed at localhost on port 3000.

## 10. Swagger for interaction with the server

To interact with the APIs there is a Swagger UI hosted which dobles as a clean documentation for this server's APIs.

Go to the following link at your browser.

```
localhost:3000/swagger
```
  

##  What's next?

If You have Ideas of improvement please email me at:

rajputneerajkumar815@gmail.com
