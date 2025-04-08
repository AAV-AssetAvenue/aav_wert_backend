import Redis from 'ioredis';

const redis = new Redis({
    host: 'localhost', // or your Redis host
    port: 6379,
    // password: 'your-password', if needed
  });
export default redis;