const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

//Edit form route
router.get(
    "/:id/edit",
    wrapAsync(async (req, res) => {
        const listing = await Listing.findById(req.params.id);
        res.render("listings/edit.ejs", { listing });
    }),
);

//  Update route
router.put(
    "/:id",
    validateListing,
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        res.redirect(`/listings/${id}`);
    }),
);

//delete route
router.delete(
    "/:id",
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        const deletedListing = await Listing.findByIdAndDelete(id);
        res.redirect("/listings");
    }),
);

//new route
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

//Create route
router.post(
    "/",
    validateListing,
    wrapAsync(async (req, res, next) => {
        const newListing = await new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    }),
);

//show route
router.get(
    "/:id",
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        let listing = await Listing.findById(id).populate("reviews");

        res.render("listings/show.ejs", { listing });
    }),
);

//index route
router.get(
    "/",
    wrapAsync(async (req, res) => {
        const allListings = await Listing.find({});
        res.render("listings/index.ejs", { allListings });
    }),
);

module.exports = router;