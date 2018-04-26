const mongoose        = require('mongoose');


var campgroundSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    description: String,
    location: String,
    lat: Number,
    lng: Number,
    createdAt: { type: Date, default: Date.now },
    author:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Comment"
        }
     ]
});

module.exports = mongoose.model("Campground", campgroundSchema);

/* Campground.create({
    name: "Granite Hill", 
    image: "https://images.unsplash.com/photo-1503835261650-d63466110731?ixlib=rb-0.3.5&s=d200749366253f91eaf11e0e5384ba26&auto=format&fit=crop&w=400&q=60",
    description: "Very rocky",
}, function(err, campground){
    if(err){
        console.log(err);
    } else {
        console.log("NEWLY CREATED CAMPGROUND:")
        console.log(campground);
    }
}) */