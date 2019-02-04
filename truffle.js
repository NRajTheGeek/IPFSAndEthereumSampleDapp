// Allows us to use ES6 in our migrations and tests.
require("babel-register");

module.exports = {
  networks: {
    develop: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gasPrice: 0,
      gas: 4500000
    }
  }
};
