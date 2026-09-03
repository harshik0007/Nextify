const express = require("express");
const app = express();
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { reviewSchema } = require("./schema.js");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

const listings = require("./routes/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/nextify";

main()
  .then((res) => console.log("Successfully connection built"))
  .catch((e) => console.log(e));

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/public/css")));
app.use(express.static(path.join(__dirname, "/public/js")));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine("ejs", ejsMate);

app.get("/", (req, res) => {
  res.redirect("/listings");
});



const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
}

app.use("/listings", listings);

//reviews
//post for a review
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  let newReview = new Review(req.body.review);

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  res.redirect(`/listings/${id}`);

}));

//delete a review
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res, next) => {
  let { id, reviewId } = req.params;

  await Listing.findOneAndUpdate({ id: `${id}` }, { $pull: { reviews: reviewId } })
  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`);
}))

app.all("/{*splat}", (req, res, next) => {
  next(new ExpressError(404, "Page Note Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Some Error Occured." } = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(3000, () => {
  console.log("Server is listning on port:", 3000);
});
