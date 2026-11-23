require("dotenv").config();

const config = {
    db: process.env.DB_URL || 'mongodb://localhost:27017/stadium',
    secret: process.env.JWT_SECRET || 'supersecret',
    expiresPassword: Number(process.env.JWT_EXPIRES_PASSWORD) || 86400,
    saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10
 }
 
 module.exports = config;