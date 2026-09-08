const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    let listing = await Listing.findById(id).populate({
        path: "reviews", populate: {
            path: "author"
        }
    }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing You Requested Does Not Exists!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}

module.exports.createListingPost = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = await new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
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

    if (typeof req.file !== undefined) {
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
    res.render("listings/edit.ejs", { listing });
}