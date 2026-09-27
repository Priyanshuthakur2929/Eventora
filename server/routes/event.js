const express = require('express');
const router = express.Router();
const {protect,admin} = require('../middleware/auth.js');
const {getAllEvents, getAllEventById: getEventById, createEvent, updateEvent, deleteEvent}= require('../controllers/eventController.js');


// get all Events--
router.get('/',getAllEvents);

//get Event by id--
router.get('/:id',getEventById);

//create Event--(admin only)
router.post('/',protect,admin,createEvent);

//update Event--(admin only)
router.put('/:id',protect,admin,updateEvent);

//delete Event--(admin only)
router.delete('/:id',protect,admin,deleteEvent);

module.exports = router;