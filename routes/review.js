const express = require("express");
const router = express.Router({ mergeParams: true});
const Listing = require("../models/listing.js");
const Review = require("../models/reviews.js");
const wrapAsync = require("../utils/wrapAysnc.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

//post request for reviews
router.post("/", validateReview,isLoggedIn, wrapAsync(reviewController.createReview));

// review delete request route 
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroy));

module.exports = router;