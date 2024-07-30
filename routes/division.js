const express = require('express');
const router = express.Router();
const Division = require('../models/division');

// Endpoint to get all divisions
router.get('/', async (req, res) => {
    try {
        const divisions = await Division.findAll();
        res.status(200).json({
            status: 200,
            data: divisions,
        });
    } catch (error) {
        console.error('Error fetching divisions:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

// Endpoint to create a new division
router.post('/', async (req, res) => {
    const { name } = req.body;
    try {
        const newDivision = await Division.create({ name });
        res.status(201).json({
            status: 201,
            data: newDivision,
            message: 'Division created successfully',
        });
    } catch (error) {
        console.error('Error creating division:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

// Endpoint to update a division
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const [updated] = await Division.update({ name }, {
            where: { id }
        });

        if (updated) {
            const updatedDivision = await Division.findOne({ where: { id } });
            res.status(200).json({
                status: 200,
                data: updatedDivision,
                message: 'Division updated successfully',
            });
        } else {
            res.status(404).json({
                status: 404,
                message: 'Division not found',
            });
        }
    } catch (error) {
        console.error('Error updating division:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

// Endpoint to delete a division
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Division.destroy({ where: { id } });
        if (result) {
            res.status(200).json({
                status: 200,
                message: 'Division deleted successfully',
            });
        } else {
            res.status(404).json({
                status: 404,
                message: 'Division not found',
            });
        }
    } catch (error) {
        console.error('Error deleting division:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

module.exports = router;
