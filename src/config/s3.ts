import { S3Client } from "@aws-sdk/client-s3";
import config from "./index";
const client = new S3Client({
  forcePathStyle: true,
  region: config.region,
  endpoint: config.endpoint_url,
  credentials: {
    accessKeyId: config.access_key_id ?? "",
    secretAccessKey: config.secret_access_key ?? "",
  },
});

export default client;
