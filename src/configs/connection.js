import mongoose from 'mongoose';
import { config } from '../configs/index.js';

async function startServer(server) {
  try {
    await mongoose.connect(config.MongoDbURI);

    mongoose.connection.on('connected', () => {
      console.log('Mongodb Atlas Database Connected...');
    });

    mongoose.connection.on('error', (err) => {
      console.log(`MongoDB connection error: ${err}`);
    });

    const port = config.port;
    server.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  } catch (err) {
    console.error('Unable to start the server:', err.message);
  }
}

export { startServer };
