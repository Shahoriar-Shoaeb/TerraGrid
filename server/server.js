require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./src/routes/auth');
const itemRoutes = require('./src/routes/items');
const warehouseRoutes = require('./src/routes/warehouses');
const stockRoutes = require('./src/routes/stock');
const movementRoutes = require('./src/routes/movements');
const userRoutes = require('./src/routes/users');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/movements', movementRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'TerraGrid API' }));

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 TerraGrid API running on http://localhost:${PORT}`);
});

module.exports = app;
