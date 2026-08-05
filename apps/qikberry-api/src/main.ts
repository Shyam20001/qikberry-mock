import dotenv from 'dotenv';
import app from './app';
import { connectMongo, sequelize } from './config/db';

dotenv.config();

const PORT = Number(process.env.PORT || 5000);

const start = async () => {
    // await sequelize.authenticate();
    // await connectMongo();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

start().catch((error) => {
    console.error('Startup failed:', error);
    process.exit(1);
});
