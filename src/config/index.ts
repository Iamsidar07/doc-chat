const {
  SUPABASE_S3_REGION,
  SUPABASE_S3_ENDPOINT,
  SUPABASE_S3_ACCESS_KEY_ID,
  SUPABASE_S3_SECRET_ACCESS_KEY,
} = process.env;
const _config = {
  region: SUPABASE_S3_REGION as string,
  endpoint_url: SUPABASE_S3_ENDPOINT as string,
  access_key_id: SUPABASE_S3_ACCESS_KEY_ID as string,
  secret_access_key: SUPABASE_S3_SECRET_ACCESS_KEY as string,
};
const config = Object.freeze(_config);
export default config;
