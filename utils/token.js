const jwt = require("jsonwebtoken");
const { secret } = require("../config/secret");

exports.generateToken = (userInfo) => {
  const payload = {
    _id: userInfo._id,
    name: userInfo.name,
    email: userInfo.email,
    role: userInfo.role,
  };

  console.log("Payload for Token:", payload);
  console.log("Token Secret:", secret.token_secret);

  const token = jwt.sign(payload, secret.token_secret, {
    expiresIn: "2d",
  });

  console.log("Generated Token:", token);
  return token;
};

// tokenForVerify
exports.tokenForVerify = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      password: user.password,
    },
    secret.jwt_secret_for_verify,
    { expiresIn: "10m" }
  );
};
