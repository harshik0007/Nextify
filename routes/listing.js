const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controller/listing.js");

//Edit form route
router.get(
    "/:id/edit", isLoggedIn, isOwner,
    wrapAsync(listingController.renderEditForm),
);

//  Update route
router.put(
    "/:id", isLoggedIn, isOwner,
    validateListing,
    wrapAsync(listingController.updateListingPut),
);

//delete route
router.delete(
    "/:id", isLoggedIn, isOwner,
    wrapAsync(listingController.deleteListings),
);

//new route
router.get("/new", isLoggedIn, listingController.renderNewForm
);

//Create route
router.post(
    "/", isLoggedIn,
    validateListing,
    wrapAsync(listingController.createListingPost),
);

//show route
router.get(
    "/:id",
    wrapAsync(listingController.showListing),
);

//index route
router.get(
    "/",
    wrapAsync(listingController.index),
);

module.exports = router;