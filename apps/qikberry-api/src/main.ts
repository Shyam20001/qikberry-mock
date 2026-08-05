import dotenv from 'dotenv';
import app from './app';
import { connectMongo, sequelize } from './config/db';

dotenv.config();

const PORT = Number(process.env.PORT || 5000);

const start = async () => {
    // await sequelize.authenticate();
    // await connectMongo();

    const server = app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}/healthz`);
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