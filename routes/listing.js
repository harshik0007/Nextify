const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controller/listing.js");

router
    .route("/")
    .post(
        isLoggedIn,
        validateListing,
        wrapAsync(listingController.createListingPost),)
    .get(
        wrapAsync(listingController.index),
    );

//new route
router.get("/new", isLoggedIn, listingController.renderNewForm
);


router
    .route("/:id")
    .put(
        isLoggedIn, isOwner,
        validateListing,
        wrapAsync(listingController.updateListingPut),)
    .delete(
        isLoggedIn, isOwner,
        wrapAsync(listingController.deleteListings),)
    .get(
        wrapAsync(listingController.showListing),
    );


//Edit form route
router.get(
    "/:id/edit", isLoggedIn, isOwner,
    wrapAsync(listingController.renderEditForm),
);


module.exports = router;