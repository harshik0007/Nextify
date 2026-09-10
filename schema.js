const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.string().allow("", null),
    category: Joi.string()
      .valid(
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
      )
      .required(),
  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().required(),
  }).required(),
})