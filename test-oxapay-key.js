const oxapay = require('oxapay');
const Merchant = oxapay.default.legacy.merchant;

const apiKey = '0S1DIS-EELK9X-QC539J-YQGPZ2';
const merchant = new Merchant(apiKey);

merchant.allowedCoins()
  .then(res => {
    console.log('Allowed coins:', JSON.stringify(res, null, 2));
  })
  .catch(err => {
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
    }
  });
