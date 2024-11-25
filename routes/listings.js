const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAysnc.js");
const { isLoggedIn, isOwner , validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
 
// to combine same path route we use router.route("path")
//here combined index and create listing route
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.newListing)
    );
    
//new route
router.get("/new",isLoggedIn, listingController.renderNewForm);
    
//combination of :id common route
router
    .route("/:id")
    .get(wrapAsync(listingController.showListings))
    .put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn,isOwner,wrapAsync(listingController.deleteListing));
    
//edit route
router.get("/:id/edit",isLoggedIn, isOwner, wrapAsync(listingController.editListings));

module.exports = router;






    // //listings route  or index route
    // router.get("/", wrapAsync(listingController.index));
    
    
    // //show route
    // router.get("/:id",wrapAsync(listingController.showListings));
    
    // //create route
    // router.post("/",isLoggedIn,validateListing,wrapAsync(listingController.newListing));
    

// //update route 
// router.put("/:id",isLoggedIn,isOwner,validateListing, wrapAsync(listingController.updateListing));

// //delete route
// router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.deleteListing));

