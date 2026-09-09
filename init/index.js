const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/nextify";

main()
  .then((res) => console.log("Successfully connection built"))
  .catch((e) => console.log(e));

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDb = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({ ...obj, owner: "6aa14e5b60a103015daba508" }));
  await Listing.insertMany(initData.data);
  console.log("Data was initialized");
};

initDb();
