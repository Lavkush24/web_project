const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req,res) => {
    let { category } = req.query;
    let filter = {};
    if(category) {
        filter.category = category;
    };
    const dataList = await Listing.find(filter);
    res.render("listings/index.ejs", { dataList });
};

module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs");
};

module.exports.showListings = async (req,res) => {
    let {id} = req.params;
    const dataList = await Listing.findById(id)
    .populate({path: "reviews", populate: {path: "author",},})
    .populate("owner");
    if(!dataList) {
        req.flash("error","Listing you requested is not exist !");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { dataList });
};

module.exports.newListing = async (req,res,next) => { 
    let responce = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    })
    .send()

    let url = req.file.path;
    let filename = req.file.filename;
    const listingData = req.body.listing;
    const newListing = new Listing(listingData);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    newListing.geometry = responce.body.features[0].geometry;

    let savelisting = await newListing.save();
    req.flash("success","New listing is Added !");
    res.redirect("/listings");
};

module.exports.editListings = async (req,res) => {
    let {id} = req.params;
    const dataList = await Listing.findById(id);
    if(!dataList) {
        req.flash("error","Listing you requested is not exist !");
        return res.redirect("/listings");
    };
    let orgUrl = dataList.image.url;
    orgUrl = orgUrl.replace("/upload", "/upload/h_100,w_200");
    res.render("listings/edit.ejs",{ dataList, orgUrl });
};

module.exports.updateListing = async (req,res) => {
    let responce = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    })
    .send()

    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url , filename};
        await listing.save();
    }
    let save = listing.geometry = responce.body.features[0].geometry;
    req.flash("success","Listing is updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req,res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success","Listing is deleted succesfully !");
    res.redirect("/listings");
};