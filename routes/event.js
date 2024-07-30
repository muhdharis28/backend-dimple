const express = require('express');
const router = express.Router();
const multer = require('multer');
const { User, Division, Event } = require('../models');
const path = require('path');
const { Op } = require('sequelize');

// Configure multer for file uploads-event
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads-event/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname); // Get the file extension
        cb(null, Date.now() + '-' + file.fieldname + ext); // Add the extension to the filename
    }
});

const upload = multer({ storage });

router.post('/upload-description-image', upload.single('descriptionImageUrl'), async (req, res) => {
    try {
        const descriptionImageUrl = `/uploads-event/${req.file.filename}`;
        res.status(200).json({
            status: 200,
            descriptionImageUrl,
            message: 'Description image uploaded successfully',
        });
    } catch (error) {
        console.error('Error uploading description image:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

router.post('/create', async (req, res) => {
    const { fromUserId, toDivisionId, toPersonId, title, date, description, descriptionImageUrl, eventFileUrls } = req.body;
    
    try {
        const event = await Event.create({
            fromUserId,
            toDivisionId,
            toPersonId,
            title,
            date,
            description,
            descriptionImageUrl,
            eventFileUrls: JSON.parse(eventFileUrls)
        });

        res.status(200).json({
            status: 200,
            data: event,
            message: 'Event created successfully',
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

router.post('/upload-event-files', upload.array('eventFiles'), async (req, res) => {
    try {
        const eventFileUrls = req.files.map(file => ({
            url: `/uploads-event/${file.filename}`,
            originalName: file.originalname,
            mimeType: file.mimetype
        }));
        res.status(200).json({
            status: 200,
            eventFileUrls,
            message: 'Event file uploaded successfully',
        });
    } catch (error) {
        console.error('Error uploading event file:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

router.put('/update/:id', upload.fields([{ name: 'descriptionImageUrl' }, { name: 'eventFileUrls' }]), async (req, res) => {
    const { id } = req.params;
    const { fromUserId, toDivisionId, toPersonId, title, date, description, status, eventFileUrls } = req.body;
    let descriptionImageUrl;

    if (req.files && req.files['descriptionImageUrl']) {
        descriptionImageUrl = `/uploads-event/${req.files['descriptionImageUrl'][0].filename}`;
    } else {
        descriptionImageUrl = req.body.descriptionImageUrl; // Use existing URL if no new image is uploaded
    }

    let existingFiles = [];
    try {
        existingFiles = JSON.parse(eventFileUrls || '[]');
    } catch (error) {
        console.error('Error parsing existing files:', error);
        return res.status(400).json({
            status: 400,
            message: 'Invalid format for existing event file URLs',
        });
    }

    const newFiles = req.files && req.files['eventFileUrls'] ? req.files['eventFileUrls'].map(file => ({
        originalName: file.originalname,
        url: `/uploads-event/${file.filename}`,
        mimeType: file.mimetype
    })) : [];

    const combinedFiles = [...existingFiles, ...newFiles];

    try {
        const [updated] = await Event.update({
            fromUserId,
            toDivisionId,
            toPersonId,
            title,
            date,
            description,
            descriptionImageUrl,
            eventFileUrls: combinedFiles,
            status
        }, {
            where: { id }
        });

        if (updated) {
            const event = await Event.findOne({ where: { id } });

            res.status(200).json({
                status: 200,
                message: 'Event updated successfully',
                data: event
            });
        } else {
            res.status(404).json({
                status: 404,
                message: 'Event not found',
            });
        }
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

// Get event details
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const event = await Event.findOne({
            where: { id },
            include: [
                { model: User, as: 'fromUser', attributes: ['id', 'username', 'email'] },
                { model: User, as: 'toPerson', attributes: ['id', 'username', 'email'] },
                { model: Division, as: 'toDivision', attributes: ['id', 'name'] }
            ]
        });

        if (!event) {
            return res.status(404).json({
                status: 404,
                message: 'Event not found',
            });
        }

        res.status(200).json({
            status: 200,
            data: event,
            message: 'Event details fetched successfully',
        });
    } catch (error) {
        console.error('Error fetching event details:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

// Delete event
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await Event.destroy({ where: { id } });

        if (deleted) {
            res.status(200).json({
                status: 200,
                message: 'Event deleted successfully',
            });
        } else {
            res.status(404).json({
                status: 404,
                message: 'Event not found',
            });
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

// Search events by title
router.get('/search/:title', async (req, res) => {
    const { title } = req.params;

    try {
        const events = await Event.findAll({
            where: {
                title: {
                    [Op.like]: `%${title}%`
                }
            },
            include: [
                { model: User, as: 'fromUser', attributes: ['id', 'username', 'email'] },
                { model: User, as: 'toPerson', attributes: ['id', 'username', 'email'] },
                { model: Division, as: 'toDivision', attributes: ['id', 'name'] }
            ]
        });
        res.status(200).json({
            status: 200,
            data: events,
            message: 'Events fetched successfully',
        });
    } catch (error) {
        console.error('Error searching events:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const events = await Event.findAll({
            include: [
                { model: User, as: 'fromUser', attributes: ['id', 'username', 'email'] },
                { model: User, as: 'toPerson', attributes: ['id', 'username', 'email'] },
                { model: Division, as: 'toDivision', attributes: ['id', 'name'] }
            ]
        });
        res.status(200).json({
            status: 200,
            data: events,
            message: 'Events fetched successfully',
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

router.post('/confirm/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const event = await Event.findOne({ where: { id } });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        event.status = 'Penerima Setuju';
        await event.save();

        res.status(200).json({ message: 'Event confirmed successfully' });
    } catch (error) {
        console.error('Error confirming event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/accept/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const event = await Event.findOne({ where: { id } });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        event.status = 'Butuh Verifikasi Penerima';
        await event.save();

        res.status(200).json({ message: 'Event accepted successfully' });
    } catch (error) {
        console.error('Error accepting event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/reject/:id', async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    try {
        const event = await Event.findOne({ where: { id } });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        event.status = 'Penerima Menolak';
        event.rejectionReason = reason; // Assuming the Event model has a rejectionReason field
        await event.save();

        res.status(200).json({ message: 'Event rejected successfully' });
    } catch (error) {
        console.error('Error rejecting event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/Ditolak/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [updated] = await Event.update({ status: 'Verifikasi Ditolak' }, { where: { id } });

        if (updated) {
            const event = await Event.findOne({ where: { id } });

            res.status(200).json({
                status: 200,
                message: 'Event Ditolakd successfully',
                data: event
            });
        } else {
            res.status(404).json({
                status: 404,
                message: 'Event not found',
            });
        }
    } catch (error) {
        console.error('Error revising event:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

router.post('/Disetujui/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [updated] = await Event.update({ status: 'Disetujui' }, { where: { id } });

        if (updated) {
            const event = await Event.findOne({ where: { id } });

            res.status(200).json({
                status: 200,
                message: 'Event Disetujuid successfully',
                data: event
            });
        } else {
            res.status(404).json({
                status: 404,
                message: 'Event not found',
            });
        }
    } catch (error) {
        console.error('Error approving event:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

router.post('/fix/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const event = await Event.findOne({ where: { id } });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        event.status = 'Perlu Verifikasi';
        event.rejectionReason = null; // Clear the rejection reason
        await event.save();

        res.status(200).json({ message: 'Event fixed successfully' });
    } catch (error) {
        console.error('Error fixing event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/reject-handler/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const event = await Event.findOne({ where: { id } });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        event.status = 'Penerima Menolak';
        await event.save();

        res.status(200).json({ message: 'Event rejected successfully' });
    } catch (error) {
        console.error('Error rejecting event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/change-handler/:id', async (req, res) => {
    const { id } = req.params;
    const { toDivisionId, toPersonId } = req.body;

    try {
        const event = await Event.findOne({ where: { id } });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        event.toDivisionId = toDivisionId;
        event.toPersonId = toPersonId;
        await event.save();

        res.status(200).json({ message: 'Handler changed successfully' });
    } catch (error) {
        console.error('Error changing handler:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/update-handler/:id', async (req, res) => {
    const { id } = req.params;
    const { toDivisionId, toPersonId, status } = req.body;

    try {
        const [updated] = await Event.update(
            { toDivisionId, toPersonId, status },
            { where: { id } }
        );

        if (updated) {
            const event = await Event.findOne({ where: { id } });

            res.status(200).json({
                status: 200,
                message: 'Handler and division updated successfully',
                data: event
            });
        } else {
            res.status(404).json({
                status: 404,
                message: 'Event not found',
            });
        }
    } catch (error) {
        console.error('Error updating handler and division:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
});

module.exports = router;
