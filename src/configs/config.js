import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT,

  nodeEnv: process.env.NODE_ENV || 'development',

  baseUrl:
    process.env.NODE_ENV === 'development'
      ? process.env.DEV_BASE_URL
      : process.env.PROD_BASE_URL,

  cors: process.env.CORS_WHITELIST,

  MongoDbURI: process.env.MONGODB_URI,

  sessionSecret: process.env.SESSION_SECRET,

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: process.env.JWT_EXPIRE || '3m',

  accessToken: process.env.ACCESS_TOKEN,
  refreshToken: process.env.REFRESH_TOKEN,

  accessExpireTime: process.env.ACCESS_EXPIRATION_TIME,
  refreshExpireTime: process.env.REFRESH_EXPIRATION_TIME,

  mailerService: process.env.MAILER_SERVICE,
  nodemailerEmail: process.env.NODEMAILER_EMAIL,
  nodemailerPassword: process.env.NODEMAILER_PASSWORD,

  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiName: process.env.CLOUDINARY_API_NAME,
  cloudinarySecretName: process.env.CLOUDINARY_SECRET_NAME,

  paystackSecret: process.env.PAYSTACK_SECRET_KEY,
};

export { config };
