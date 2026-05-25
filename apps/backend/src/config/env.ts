interface EnvConfig {
  port: number;
  nodeEnv: string;
  mongodbUri: string;
  redisUrl: string;
  groqApiKey: string;
  corsOrigin: string;
}

function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    console.warn(`⚠️  Missing environment variable: ${key}`);
    return '';
  }
  return value;
}

export const env: EnvConfig = {
  port: parseInt(getEnvVar('PORT', '5000'), 10),
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  mongodbUri: getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/vedaai'),
  redisUrl: getEnvVar('REDIS_URL', 'redis://localhost:6379'),
  groqApiKey: getEnvVar('GROQ_API_KEY', ''),
  corsOrigin: getEnvVar('CORS_ORIGIN', 'http://localhost:3000'),
};

export const isDev = env.nodeEnv === 'development';
