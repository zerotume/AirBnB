const express = require('express');
const router = express.Router();
const {Spot, Image, Review, User, Booking, sequelize} = require('../db/models');
const {setTokenCookie, restoreUser, requireAuth, AuthorCheck, refuseOwner, bookingReq} = require('../utils/auth.js');
const {handleValidationErrors} = require('../utils/validation.js');
const {check} = require('express-validator');
const user = require('../db/models/user');

router.get('/mybooking', restoreUser, requireAuth, async (req, res) => {
    let myId = req.user.toJSON().id;

    let bookings = await Booking.findAll({
        where:{userId:myId},
        include:{
            model:Spot.scope('noCreateUpdate')
        }
    });

    res.json({Bookings:bookings});
});

let d = new Date();
let today = d.toISOString().slice(0,10);

const validateBooking = [
    check('startDate')
        .exists({checkFalsy:true})
        .notEmpty()
        .isDate()
        .withMessage('Start date YYYY-MM-DD is required'),
    check('endDate')
        .exists({checkFalsy:true})
        .notEmpty()
        .isDate()
        .withMessage('End date YYYY-MM-DD is required'),
    handleValidationErrors
];

router.put('/:id', restoreUser, requireAuth, bookingReq, AuthorCheck,
    validateBooking, async (req,res,next) => {
        let {startDate, endDate} = req.body;
        let booking = req.booking;
        if(booking.toJSON().endDate < today){
            const err = Error('Past bookings can\'t be modified');
            err.title = 'Past bookings can\'t be modified'
            err.message = 'Past bookings can\'t be modified';
            err.status = 400;
            return next(err);
        }

        if(endDate < today){
            const err = Error('You cannot end the booking to the past.');
            err.title = 'You cannot end the booking to the past.'
            err.message = 'You cannot end the booking to the past.';
            err.status = 400;
            return next(err);
        }
        try{
            booking.set({
                startDate,
                endDate
            });
            await booking.save();
        }catch(e){
            if(e.name === 'SequelizeUniqueConstraintError'){
                const err = Error('User already has a review for this spot');
                err.title = 'Sorry, this spot is already booked for the specified dates'
                err.message = 'Sorry, this spot is already booked for the specified dates';
                err.errors = {
                    startDate:"Start date conflicts with an existing booking",
                    endDate: "End date conflicts with an existing booking"
                };
                err.status = 403;
                return next(err);
            }else{
                return next(e);
            }
        }

        res.json(booking);
    });

module.exports = router;
