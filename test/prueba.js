

const sdk = require('api')('@tackle-api/v1.0#2j3hc4zls9bwzmd');

sdk.auth('asdasdaasd');
sdk.v1ListProducts()
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));