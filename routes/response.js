const express = require('express');
const multer = require('multer');
const Response = require('../models/response');
const Event = require('../models/event');
const User = require('../models/user');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads-responses/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Get the file extension
    cb(null, Date.now() + '-' + file.fieldname + ext); // Add the extension to the filename
  }
});
const upload = multer({ storage });

// Route to upload a response image
router.post('/upload-response-image', upload.single('responseImageUrl'), async (req, res) => {
  try {
    const responseImageUrl = `/uploads-responses/${req.file.filename}`;
    res.status(200).json({
      status: 200,
      responseImageUrl,
      message: 'Response image uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading response image:', error);
    res.status(500).json({
      status: 500,
      message: 'Internal server error',
    });
  }
});

// Route to upload response files
router.post('/upload-response-files', upload.array('responseFiles'), async (req, res) => {
  const responseFileUrls = req.files.map(file => ({
    url: `/uploads-responses/${file.filename}`,
    originalName: file.originalname,
    mimeType: file.mimetype
  }));

  try {
    res.status(200).json({
      status: 200,
      responseFileUrls,
      message: 'Response files uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading response files:', error);
    res.status(500).json({
      status: 500,
      message: 'Internal server error',
    });
  }
});

// Route to create a response
router.post('/create', async (req, res) => {
  const { responseText, responseImageUrl, responseFileUrls, eventId, userId, userRole } = req.body;
  try {
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const response = await Response.create({
      responseText,
      responseImageUrl,
      responseFileUrls: JSON.parse(responseFileUrls),
      eventId,
      userId,
    });

    // If the user role is 'verificator', update the event status to 'Ditolak'
    if (userRole === 'delegation_verificator') {
      event.status = 'Ditolak';
      await event.save();
    }

    res.status(201).json({
      message: `Response created successfully${userRole === 'delegation_verificator' ? ' and event status updated to Ditolak' : ''}`,
      data: response,
    });
  } catch (error) {
    console.error('Error creating response:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Get responses for an event
router.get('/event/:eventId', async (req, res) => {
  const { eventId } = req.params;

  try {
    const responses = await Response.findAll({
      where: { eventId },
      include: [{ model: User, as: 'user' }]
    });

    res.status(200).json({
      status: 200,
      data: responses,
      message: 'Responses fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({
      status: 500,
      message: 'Internal server error',
    });
  }
});

module.exports = router;
