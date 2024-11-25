const Listing = require("../models/listing.js");
const Review = require("../models/reviews.js");

module.exports.createReview = async (req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success","New review is Added !");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroy = async (req,res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: {review: reviewId} });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","review is deleted!");
    res.redirect(`/listings/${id}`);
};