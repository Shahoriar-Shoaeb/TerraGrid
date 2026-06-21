const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const userSelect = { id: true, name: true, email: true, role: true, isActive: true, createdAt: true };

const getAll = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({ select: userSelect, orderBy: { createdAt: 'asc' } });
        res.json(users);
    } catch (err) {
        next(err);
    }
};

const create = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const hashed = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: { name, email, password: hashed, role: role || 'MANAGER' },
            select: userSelect,
        });
        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
};

const patchUser = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const { role, isActive } = req.body;
        const data = {};
        if (role !== undefined) data.role = role;
        if (isActive !== undefined) data.isActive = isActive;
        const user = await prisma.user.update({ where: { id }, data, select: userSelect });
        res.json(user);
    } catch (err) {
        next(err);
    }
};

module.exports = { getAll, create, patchUser };
