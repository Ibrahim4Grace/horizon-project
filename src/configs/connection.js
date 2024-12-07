import mongoose from 'mongoose';
import { config } from '../configs/index.js';
import { log } from '../utils/index.js';

async function startServer(server) {
  try {
    await mongoose.connect(config.MongoDbURI);

    mongoose.connection.on('connected', () => {
      log.info('Mongodb Atlas Database Connected...');
    });

    mongoose.connection.on('error', (err) => {
      log.error(`MongoDB connection error: ${err}`);
    });

    const port = config.port;
    server.listen(port, () => {
      log.info(`Server started on port ${port}`);
    });
  } catch (err) {
    log.error('Unable to start the server:', err.message);
  }
}

export { startServer };
