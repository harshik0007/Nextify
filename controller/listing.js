const { number } = require("joi");
const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    let { page = 1, limit = 8 } = req.query;
    page = parseInt(page);
    let skip = (page - 1) * limit;
    const allListings = await Listing.find({});
    const Listings = await Listing.find({}).skip(skip).limit(limit);
    let total_pages = Math.ceil(allListings.length / limit);
    console.log(total_pages);
    res.render("listings/index.ejs", { Listings, total_pages, page, limit });
}

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    let listing = await Listing.findById(id).populate({
        path: "reviews", populate: {
            path: "author"
        }
    }).populate("owner");
    console.log(listing);
    if (!listing) {
        req.flash("error", "Listing You Requested Does Not Exists!");
        return res.redirect("/listings");
    }

    let ratingAvg = 0;
    for (let i = 0; i < listing.reviews.length; i++) {
        ratingAvg += listing.reviews[i].rating;
    }
    ratingAvg = ratingAvg / (listing.reviews.length)

    res.render("listings/show.ejs", { listing, ratingAvg });
}

module.exports.createListingPost = async (req, res, next) => {

    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    })
        .send()
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = await new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs")
};

module.exports.deleteListings = async (req, res) => {
    let { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Successfully Deleted!");
    res.redirect("/listings");
}

module.exports.updateListingPut = async (req, res) => {

    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Successfully Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.renderEditForm = async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "Listing You Requested Does Not Exists!");
        return res.redirect("/listings");
    }

    let originalUrl = listing.image.url;
    originalUrl = originalUrl.replace("/upload", "/upload/w_150");

    res.render("listings/edit.ejs", { listing, originalUrl });
}

module.exports.search = async (req, res, next) => {
    let { q } = req.query;
    let { page = 1, limit = 6 } = req.query;
    page = Number(page);
    let skip = (page - 1) * limit;
    const allSearchResult = await Listing.find({
        $or: [
            { title: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } },
            { category: { $regex: q, $options: "i" } }
        ]
    })
    const searchResult = await Listing.find({
        $or: [
            { title: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } },
            { category: { $regex: q, $options: "i" } }
        ]
    }).skip(skip).limit(limit);
    let total_pages = Math.ceil(allSearchResult.length / limit);
    console.log(total_pages)
    res.render("listings/search.ejs", { searchResult, q, total_pages, page, limit });
}

module.exports.searchSuggestions = async (req, res, next) => {
    let { q } = req.query;
    if (!q || !q.trim()) {
        return res.json([]);
    }
    const searchResult = await Listing.find({
        $or: [
            { title: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } },
            { category: { $regex: q, $options: "i" } }
        ]
    }).select("title location country category")
        .limit(5);

    res.json(searchResult);
}

module.exports.categoryviseListings = async (req, res, next) => {
    let { category: c } = req.params;
    let { page = 1, limit = 6 } = req.query;
    page = Number(page);
    let skip = (page - 1) * limit;
    const allCategoryMatch = await Listing.find({ category: c });
    if (allCategoryMatch.length == 0) {
        req.flash("error", `No any Listing found in ${c} category`);
        return res.redirect("/listings");
    }
    const categoryMatch = await Listing.find({ category: c }).skip(skip).limit(limit);
    let total_pages = Math.ceil(allCategoryMatch.length / limit);
    res.render("listings/categorywiseLis.ejs", { categoryMatch, c, total_pages, page, limit });
}