const Listing = require("./models/listing");
const Review = require("./models/reviews.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged In!");
        return res.redirect("user/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

//middleware for authentication of user
module.exports.isOwner = async (req,res,next) => {
    let { id } = req.params;
    let listings = await Listing.findById(id);
    if(!listings.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not owner !!");
        return res.redirect(`/listings/${id}`);
    };
    next();
};

//validate listing function which is call in request to validate schema if any one requestiong through hopescoth etc
module.exports.validateListing = (req,res,next) => {
    let { error } = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

//joi validation for review schema 
module.exports.validateReview = (req,res,next) => {
    let { error } = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else {
        next();
    }
};

// middleware for authentication of review author
module.exports.isReviewAuthor = async (req,res,next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "you are not the author of review!!");
        return res.redirect(`/listings/${id}`);
    };
    next();
};