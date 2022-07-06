const express = require('express');
const router = express.Router();
const {Spot, Image, Review, User, Booking, sequelize} = require('../db/models');
const {setTokenCookie, restoreUser, requireAuth, AuthorCheck, refuseOwner, reviewReq} = require('../utils/auth.js');
const {handleValidationErrors} = require('../utils/validation.js');
const {check} = require('express-validator');
const user = require('../db/models/user');

router.get('/myreview', restoreUser, requireAuth, async (req, res) => {
    let myId = req.user.toJSON().id;

    let reviews = await Review.findAll({
        where:{userId:myId},
        include:[
            {
                model:User
            },
            {
                model:Spot.scope('noCreateUpdate')
            },
            {
                model:Image,
                as:'images',
                where:{imageType:'review'},
                attributes:['url'],
                required:false
            }
        ]
    });

    res.json({Reviews:reviews});
});

const validateReview = [
    check('review')
        .exists({checkFalsy:true})
        .notEmpty()
        .withMessage('Review text is required'),
    check('stars')
        .exists({checkFalsy:true})
        .notEmpty()
        .isInt({min:1, max:5})
        .withMessage('Stars must be an integer from 1 to 5'),
    handleValidationErrors
];

router.put('/:id', restoreUser, requireAuth, reviewReq, AuthorCheck,
    validateReview, async (req, res, next) => {
        let {review, stars} = req.body;
        let thatReview = req.review;
        try{
            thatReview.set({
                review,
                stars
            });
            await thatReview.save();
        }catch(err){
            next(err);
        }

        return res.json(thatReview);
    });

router.delete('/:id', restoreUser, requireAuth, reviewReq, AuthorCheck,
    async (req, res) => {
        let thatReview = req.review;

        await thatReview.destroy();

        return res.json({
            message: "Successfully deleted",
            statusCode: 200
          });
});

module.exports = router;
