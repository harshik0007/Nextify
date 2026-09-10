const mongoose = require("mongoose");
const Review = require("./review.js");

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    url: String,
    filename: String
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  price: {
    type: Number,
  },
  geometry: {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: { type: [Number], required: true }
  },
  location: {
    type: String,
  },
  country: {
    type: String,
  },
  category: {
    type: String,
    enum: [
      "Trending",
      "Room",
      "Camping",
      "Castle",
      "Beach",
      "Mountain",
      "Top Rated",
      "Farm",
      "Mountain City",
      "Amazing Pools",
      "Boats",
      "Arctic",
      "Pet Friendly",
      "Luxury",
      "Hotels_Resorts",
      "City"
    ]
  }
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
