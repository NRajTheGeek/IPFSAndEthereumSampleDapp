var KYC = artifacts.require("./KYC.sol");

module.exports = function(deployer) {
  deployer.deploy(KYC);
};