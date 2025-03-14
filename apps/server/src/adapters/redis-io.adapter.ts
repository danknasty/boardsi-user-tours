import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ServerOptions } from 'socket.io';

export class RedisIoAdapter extends IoAdapter {
  private readonly configService: ConfigService;
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private pubClient: ReturnType<typeof createClient>;
  private subClient: ReturnType<typeof createClient>;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  constructor(app: any) {
    super(app);
    this.configService = app.get(ConfigService);
  }

  async connectToRedis(): Promise<void> {
    try {
      // Support both uppercase and lowercase Redis environment variables
      const host = this.configService.get('redis.host') ||
        process.env.REDIS_HOST ||
        process.env.Redis_HOST;

      const port = this.configService.get('redis.port') ||
        process.env.REDIS_PORT ||
        process.env.Redis_PORT ||
        6379;

      const password = this.configService.get('redis.password') ||
        process.env.REDIS_PASSWORD ||
        process.env.REDIS_PASS ||
        process.env.Redis_PASS;

      // Build URL from components if available
      const url = host ? `redis://${host}:${port}` : process.env.REDIS_URL;

      if (!url) {
        console.warn('No Redis host or URL found, socket.io will run without Redis adapter');
        return;
      }

      console.log(`Connecting to Redis at ${host || url}:${port}`);

      // Create Redis client with improved configuration
      this.pubClient = createClient({
        url,
        password,
        socket: {
          reconnectStrategy: (retries) => {
            // Exponential backoff with max delay
            const delay = Math.min(retries * 50, 1000);
            console.log(`Redis reconnecting, attempt ${retries}. Next attempt in ${delay}ms`);
            return delay;
          },
          connectTimeout: 30000, // 30 seconds
          keepAlive: 5000 // Send keepalive every 5 seconds
        }
      });

      this.subClient = this.pubClient.duplicate();

      // Set up error handlers
      this.pubClient.on('error', (err) => {
        console.error('Redis pub client error:', err);
      });

      this.subClient.on('error', (err) => {
        console.error('Redis sub client error:', err);
      });

      // Connect to Redis with retry logic
      await this.connectWithRetry();

      this.adapterConstructor = createAdapter(this.pubClient, this.subClient);
      console.log('Redis adapter created successfully');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      // Allow server to start without Redis in fallback mode
      console.warn('Socket.io will run without Redis adapter');
    }
  }

  private async connectWithRetry(): Promise<void> {
    try {
      await Promise.all([this.pubClient.connect(), this.subClient.connect()]);
      console.log('Connected to Redis successfully');
      this.reconnectAttempts = 0;
    } catch (error) {
      this.reconnectAttempts++;
      if (this.reconnectAttempts <= this.MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(this.reconnectAttempts * 1000, 5000);
        console.error(`Redis connection attempt ${this.reconnectAttempts} failed. Retrying in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.connectWithRetry();
      } else {
        console.error('Failed to connect to Redis after maximum attempts:', error);
        throw error;
      }
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const serverOptions = {
      ...options,
      cors: {
        origin: true,
        allowedHeaders: true,
        methods: true,
        credentials: true,
      },
    };

    const server = super.createIOServer(port, serverOptions);

    server.on('connection', (socket) => {
      console.log('New connection from origin:', socket.handshake.headers.origin);
    });

    // Only use the Redis adapter if we successfully connected
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    } else {
      console.warn('Running socket.io without Redis adapter');
    }

    return server;
  }
}
