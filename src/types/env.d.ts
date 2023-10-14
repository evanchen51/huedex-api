declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      REDIS_URL: string;
      PORT: string;
      SESSION_SECRET: string;
      CORS_ORIGIN_1: string;
      CORS_ORIGIN_2: string;
      API_URL: string;
      ADMIN_PASSCODE: string;
      GOOGLE_CLIENTID: string;
      GOOGLE_CLIENTSECRET: string;
      GOOGLE_APIKEY: string;
      S3_BUCKETNAME: string;
      S3_REGION: string;
      S3_ACCESSKEYID: string;
      S3_SECRETACCESSKEY: string;
    }
  }
}

export {}
