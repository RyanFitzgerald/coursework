const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Please enter a store name'
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String],
    created: {
        type: Date,
        default: Date.now
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [{
            type: Number,
            required: 'You must supply coordinates!'
        }],
        address: {
            type: String,
            required: 'You must supply an address!'
        }
    },
    photo: String,
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'You must supply an author'
    }
}, {
    toJSON: { virtuals: true }, // Show virtuals explicitly, but not needed
    toObject: { virtuals: true } // Show virtuals explicitly, but not needed
});

// Define all index
storeSchema.index({ // Compound index
    name: 'text',
    description: 'text'
});

storeSchema.index({ location: '2dsphere' });

// Need regular and not arrow function since 'this' is needed
storeSchema.pre('save', async function(next) {
    if (!this.isModified('name')) {
        next(); // Skip
        return; // Stop this function from running
    }
    this.slug = slug(this.name);

    // Find other stores with same slug
    const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const storesWithSlug = await this.constructor.find({slug : slugRegex});

    if (storesWithSlug.length) {
        this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
    }

    next();
});

storeSchema.statics.getTagsList = function() {
    // Return so it returns the awaitable promise
    return this.aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
};

storeSchema.statics.getTopStores = function() {
    // Return so it returns the awaitable promise
    return this.aggregate([
        // Lookup stores and populate reviews
        // Takes model name and lowercases + adds 's' to end for 'reviews'
        { $lookup: { from: 'reviews', localField: '_id', foreignField: 'store', as: 'reviews' } },
        // Filter for only items with 2 or more reviews
        { $match: { 'reviews.1': { $exists: true } } }, // Check that second item in reviews exists (zero based)
        // Add average reviews field
        // MongoDB 3.4 up will have $addField which will just add the field
        { $project: {
            photo: '$$ROOT.photo',
            name: '$$ROOT.name',
            reviews: '$$ROOT.reviews',
            slug: '$$ROOT.slug',
            averageRating: { $avg: '$reviews.rating' } // Get avg of all reviews ($ means field from data piped in)  
        } },
        // Sort it by our new field, highest reviews first
        { $sort: { averageRating: -1 } }, // High to low
        // Limit to at most 10
        { $limit: 10 }
    ]);
};

// Find reviews where store id === review store property
// Mongoose thing, not from mongodb by default
storeSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id', // Which field on Store
    foreignField: 'store' // which field on Review
});

function autopopulate(next) {
    this.populate('reviews');
    next();
}

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Store', storeSchema);