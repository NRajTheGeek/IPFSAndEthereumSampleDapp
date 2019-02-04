var Bidder = artifacts.require("Bidder");

module.exports = function(done) {
  console.log("Getting deployed version of Bidder...")
  Bidder.deployed().then(function(instance) {
    console.log("Setting value to 200...");
    return instance.set(200, {privateFor: ["BULeR8JyUWhiuuCMU/HLA0Q5pzkYT+cHII3ZKBey3Bo="]});
  }).then(function(result) {
    console.log("Transaction:", result.tx);
    console.log("Finished!");
    done();
  }).catch(function(e) {
    console.log(e);
    done();
  });
};