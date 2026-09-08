const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
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
        isLoggedIn,
        upload.single("listing[image]"), validateListing,
        wrapAsync(listingController.createListingPost),)
    ;

//new route
router.get("/new", isLoggedIn, listingController.renderNewForm
);


router
    .route("/:id")
    .put(
        isLoggedIn, isOwner,
        upload.single("listing[image]"), validateListing,
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

router.get("/:userId/:username", isLoggedIn, wrapAsync(listingController.personalCreatedShowCase));


module.exports = router;