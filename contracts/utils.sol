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