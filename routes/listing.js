const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing, isVerifiedAccount } = require("../middleware.js");
const listingController = require("../controller/listing.js");
const multer = require('multer');
const { storage, cloudinary } = require("../cloudConfig.js");
const upload = multer({ storage })

router
    .route("/")
    .get(
        wrapAsync(listingController.index),
    )
    .post(
        isLoggedIn, isVerifiedAccount,
        upload.single("listing[image]"), validateListing,
        wrapAsync(listingController.createListingPost),)
    ;

//new route
router.get("/new", isLoggedIn, isVerifiedAccount, listingController.renderNewForm
);

router.get("/search", wrapAsync(listingController.search));

router.get("/search-suggestions", wrapAsync(listingController.searchSuggestions));

router.get("/category/:category", wrapAsync(listingController.categoryviseListings));

router
    .route("/:id")
    .put(
        isLoggedIn, isVerifiedAccount, isOwner,
        upload.single("listing[image]"), validateListing,
        wrapAsync(listingController.updateListingPut),)
    .delete(
        isLoggedIn, isVerifiedAccount, isOwner,
        wrapAsync(listingController.deleteListings),)
    .get(
        wrapAsync(listingController.showListing),
    );


//Edit form route
router.get(
    "/:id/edit", isLoggedIn, isVerifiedAccount, isOwner,
    wrapAsync(listingController.renderEditForm),
);

module.exports = router;