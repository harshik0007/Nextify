const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { validateReview, isLoggedIn, isReviewAuthor, isVerifiedAccount } = require("../middleware.js");
const reviewController = require("../controller/review.js")


//reviews
//post for a review
router.post("/", isLoggedIn, isVerifiedAccount, validateReview, wrapAsync(reviewController.reviewCreatePost));

//delete a review
router.delete("/:reviewId", isLoggedIn, isVerifiedAccount, isReviewAuthor, wrapAsync(reviewController.reviewDelete));

module.exports = router;