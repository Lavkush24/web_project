if(process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const user = require("./models/user.js");

const listingRouters = require("./routes/listings.js");
const reviewRouters = require("./routes/review.js");
const userRouters = require("./routes/user.js");

// this is atlas online database 
const dbUrl = process.env.ATLASDB_URL || 'mongodb://127.0.0.1:27017/wanderlust';

main()
    .then(() => {
        console.log("Database is connected");
    }).catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl); 
}

app.set("view engine", "ejs");
app.set("views",path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 60 * 60,
});

store.on("error", () => {
    console.log("Error in Atlas database",err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

app.use(session(sessionOptions));
app.use(flash());

//passport initilization and for authentication by localstrategy of user
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());


//middleware for flash messages or store variables using locals for direct use in ejs files
app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

//when route is listing use this route
app.use("/listings", listingRouters);
app.use("/listings/:id/reviews", reviewRouters);
app.use("/user", userRouters);


app.use("/",listingRouters);

//if reqest come on a unknown route
app.all("*",(req,res,next) => {
    next(new ExpressError(404,"Page not found"));
});

//err handler 
app.use((err,req,res,next) => {
    let {statusCode=500, message="somthing went wrong"} = err;
    res.status(statusCode);
    res.render("listings/error.ejs",{ err });
});

app.listen(8080, () => {
    console.log("server is listening at 8080...");
});

// //demo user request
// app.get("/demouser", async (req,res) => {
//     let fakeUser = new user({
//         email: "student@gmail.com",
//         username: "demo-user", 
//     });
    
//     let registeredUser = await user.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });

// app.get("/testing", async (req,res) => {
//     let sampleListing = new Listing({
//         title: "The Villa",
//         discription: "the best way of doing",
//         price: 78000,
//         location: "Agra",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("testing done");
//     res.send("succesfull");
// });