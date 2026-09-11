if (process.env.NODE_ENV != "production") {
  require('dotenv').config();
}

const express = require("express");
const app = express();
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const mongoose = require("mongoose");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/user.js");
const MongoStore = require("connect-mongo").default;

const db_url = process.env.ATLASDB_URL;

main()
  .then((res) => console.log("Successfully connection built"))
  .catch((e) => console.log(e));

async function main() {
  await mongoose.connect(db_url);
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

const store = MongoStore.create({
  mongoUrl: db_url,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
})

store.on("error", () => {
  console.log("ERROR IN MONGO SESSION STORE", error);
})

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
    maxAge: 1000 * 60 * 60 * 24 * 3,
    httpOnly: true,
  }
}

// app.get("/", (req, res) => {
//   res.redirect("/listings");
// });

app.use(session(sessionOptions));
app.use(flash()); //make sure use before routes

app.use(passport.initialize());
app.use(passport.session());
app.get("/test", (req, res) => {
  res.send("Google route is working");
});
passport.use(new LocalStrategy(User.authenticate()));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://nextify-vwbr.onrender.com/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);

      let user = await User.findOne({ email: profile.emails[0].value });

      if (!user) {
        user = await User.create({
          username: profile.displayName,
          email: profile.emails[0].value,
          isVerified: true
        });
      }

      return done(null, user);
    }
  )
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  // console.log(res.locals.currUser);
  next();
})

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.get("/demo", async (req, res) => {
  let fakeUser = new User({
    email: "abc@gmail.com",
    username: "abc"
  });

  let registeredUser = await User.register(fakeUser, "helloworld");
  res.send(registeredUser);
})

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
