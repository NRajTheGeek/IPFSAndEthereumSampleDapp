var Bidder2 = artifacts.require("NodeB");

module.exports = function(done) {
  console.log("Getting deployed version of Bidder2...")
  Bidder2.deployed().then(function(instance) {
    console.log("Setting value to 210...");
    return instance.placeABid('bucky_barns', 210, {privateFor: ["BULeR8JyUWhiuuCMU/HLA0Q5pzkYT+cHII3ZKBey3Bo="]});
  }).then(function(result) {
    console.log("Transaction:", result.tx);
    console.log("Finished!");
    done();
  }).catch(function(e) {
    console.log(e);
    done();
  });
};