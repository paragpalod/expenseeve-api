const mfa = require('multi-factor-authentication');

const gernerateSecretForAuthetiator = {
  auth: false,
  tags: ['api', 'mfa'],
  handler: async () => {
    try {
      const secret = mfa.generateQrCode({});
      return secret;
    } catch (Exception) {
      console.log(Exception);
      return Exception;
    }
  }
};

const verifyTotp = {
  auth: false,
  tags: ['api', 'mfa'],
  handler: async () => {
    try {
      const verified = mfa.varifyTotp('LZGCU4DVN5XFINSNMRXXO5BSMZNXGQKW', 622713);
      return verified;
    } catch (Exception) {
      console.log(Exception);
      return Exception;
    }
  }
};

exports.routes = [
  {
    method: 'POST',
    path: '/gernerateSecretForAuthetiator',
    config: gernerateSecretForAuthetiator
  },
  {
    method: 'POST',
    path: '/verifyTotp',
    config: verifyTotp
  }
];
