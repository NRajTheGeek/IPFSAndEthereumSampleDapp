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