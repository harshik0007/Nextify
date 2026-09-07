const Review = require("../models/review");
const Listing = require("../models/listing");

module.exports.reviewCreatePost = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Created!");

    res.redirect(`/listings/${id}`);

}

module.exports.reviewDelete = async (req, res, next) => {
    let { id, reviewId } = req.params;

    await Listing.findOneAndUpdate({ id: `${id}` }, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");

    res.redirect(`/listings/${id}`);
}