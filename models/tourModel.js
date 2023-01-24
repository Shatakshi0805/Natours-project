const mongoose = require("mongoose");

const slugify = require("slugify");

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Tour must have a name"],
        unique: true
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, "A Tour must have a duration"]
    },
    maxGroupSize: {
        type: Number,
        required: [true, "A Tour must have a group size"]
    },
    difficulty: {
        type: String,
        required: [true, "A Tour must have a difficulty"]
    },
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "Tour must have a price"]
    },
    priceDiscount: Number,
    summary: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, "A tour must have a cover image"]
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }
    }, 
    {
    toJSON: { virtuals: true},//to convert virtual property "durationWeeks" to JSON
    toObject: { virtuals: true}// to convert virtual property "durationWeeks" in object form like others above
    }
);

//mongoose virtual property => doesnt get saved in DB
tourSchema.virtual("durationWeeks").get(function () {
    return this.duration / 7;//duration week for duration of every tour
})

//DOCUMENT MIDDLEWARE: RUNS BEFORE .save() AND .create() BUT NOT ON .insertMany()
tourSchema.pre("save", function (next) {
    // console.log(this);
    this.slug = slugify(this.name, { lower: true});//lowercase form
    next();
})

//ALSO CALLED PRE SAVE HOOK / MIDDLEWARE
// tourSchema.pre("save", function (next) {
//     console.log("will save document...");
//     next();
// })

// //POST SAVE HOOK OR POST SAVE MIDDLEWARE
// tourSchema.post("save", function (doc, next) {//doc saved
//     console.log(doc);
//     next();
// })

tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true}})
    
    this.start = Date.now();
    next();
})

tourSchema.post(/^find/, function (docs, next) {//docs found through find() query
    console.log(`Query took ${Date.now() - this.start} miliseconds`);
    console.log(docs);
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;