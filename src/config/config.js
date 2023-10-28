import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

dotenvExpand.expand(dotenv.config('./../../.env'));

// get data from .env file
export const config = {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 3000,
    database_dialect: process.env.DB_DIALECT || 'mysql',
    database_host: process.env.DB_HOST || 'localhost',
    database_port: process.env.DB_PORT || '3306',
    database_name: process.env.DB_NAME || 'dynamic-chat-app',
    database_user: process.env.DB_USER || 'root',
    database_password: process.env.DB_PASSWORD || '',
    database_charset: process.env.DB_CHARSET || 'utf8mb4',
    database_collation: process.env.DB_COLLATION || 'utf8mb4_unicode_ci',
    mongo_local_db: process.env.MONGO_LOCAL_DB || '',
    mongo_cluster_db: process.env.MONGO_CLUSTER_DB || '',
};

config.secret = process.env.JWT_SECRET_KEY || '';

//** bcrypt */
config.bcrypt_salt_round = process.env.BCRYPT_SALT_ROUND || 10;

//** Token Key */
config.jwt_encryption = process.env.JWT_ENCRYPTION || '';
config.limit = process.env.LIMIT || 10;
config.distance = process.env.DISTANCE || 10;

//* s3 bucket credentials */
config.AWS_SES_ACCESS_KEYID = process.env.AWS_SES_ACCESS_KEYID || '';
config.AWS_SES_SECRET_ACCESS_KEY = process.env.AWS_SES_SECRET_ACCESS_KEY || '';
config.AWS_SES_REGION = process.env.AWS_SES_REGION || '';
config.CLOUDFRONT_BASE_URL = process.env.CLOUDFRONT_BASE_URL || '';
config.AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || '';
config.AWS_URL = process.env.AWS_URL || '';
config.AWS_USE_PATH_STYLE_ENDPOINT = process.env.AWS_USE_PATH_STYLE_ENDPOINT || '';