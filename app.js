const express = require("express");
const app = express();
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const port = 3000;

const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/nextify";

const Listing = require("./models/listing.js");

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

//Edit form route
app.get("/listings/:id/edit", async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  res.render("listings/edit.ejs", { listing });
});

//  Update route
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
});

app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});

//new route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Create route
app.post("/listings", async (req, res) => {
  const newListing = await new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
});

//show route
app.get("/listings/:id", async (req, res) => {
  const { id } = req.params;
  let listing = await Listing.findById(id);

  res.render("listings/show.ejs", { listing });
});

//index route
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.listen(port, () => {
  console.log("Server is listning on port:", port);
});
