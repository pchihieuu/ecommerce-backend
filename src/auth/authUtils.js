"use strict";

const JWT = require("jsonwebtoken");

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // Create access token
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });

    // Create refresh token
    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    // Verify access token (optionals)
    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error(`error verify::`, err);
      } else {
        console.log(`decode verify::`, decode);
      }
    });

    console.log(`Created Tokens::`, { accessToken, refreshToken });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error(`Create Token Error::`, error);
    throw error;
  }
};

module.exports = {
  createTokenPair,
};
