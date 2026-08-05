import dotenv from 'dotenv';
import app from './app';
import { connectMongo, sequelize } from './config/db';

dotenv.config();

const PORT = Number(process.env.PORT || 5000);
const HOST = String(process.env.HOST || "127.0.0.1")

const start = async () => {
    // await sequelize.authenticate();       //commented for testing purpose by shyam..//
    // await connectMongo();

    const server = app.listen(PORT, HOST, () => {
        console.log(`Server running on http://${HOST}:${PORT}/healthz`);
    });

    const shutdown = () => {
        console.log('\nGracefully shutting down...');

        server.close(() => {
            console.log('HTTP server closed');
            process.exit(0);
        });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
};

start().catch((error) => {
    console.error('Startup failed:', error);
    process.exit(1);
});