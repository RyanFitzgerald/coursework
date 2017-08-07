const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');

        if (isPhoto) {
            next(null, true);
        } else {
            next({message: 'That filetype is not allowed!'}, false);
        }
    }
};

exports.homePage = (req, res) => {
    res.render('index');
};

exports.addStore = (req, res) => {
    res.render('editStore', { title: 'Add Store' });
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
    // Check if no new file to resize
    if (!req.file) {
        next(); // Skip to next middleware
        return;
    }

    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    
    // Now we resize
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);

    // Once written to filesystem, keep going
    next();
};

exports.createStore = async (req, res) => {
    req.body.author = req.user._id;
    // Put it all together so the response from await gets added to the store const
    const store = await (new Store(req.body)).save();
    req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`);
    res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
    const page = req.params.page || 1; // 1 if on home page
    const limit = 4; // 4 per page
    const skip = (page * limit) - limit;

    const storesPromise = Store
        .find()
        .skip(skip)
        .limit(limit)
        .sort({ created: 'desc' });

    const countPromise = Store.count();

    const [stores, count] = await Promise.all([storesPromise, countPromise]);

    const numPages = Math.ceil(count / limit);

    if (!stores.length && skip) {
        req.flash('info', `You asked for page ${page}, but it doesn't exist. Redirected to page ${numPages} instead.`);
        res.redirect(`/stores/page/${numPages}`);
        return;
    }

    res.render('stores', { title: 'Stores', stores, count, page, numPages, count });
};

const confirmOwner = (store, user) => {
    if (!store.author.equals(user._id)) {
        throw Error('You must own a store in order to edit it!');
    }
};

exports.editStore = async (req, res) => {
    // 1. Find store given the ID
    const store = await Store.findOne({ _id: req.params.id });
    // 2. Confirm they are owner of the store
    confirmOwner(store, req.user);
    // 3. Render out the edit form so the user can update
    res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
    // Set location data to be point since it gets removed on update
    req.body.location.type = 'Point';
    // 1. Find and update store
    const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true, // Return new store instead of old
        runValidators: true // Force model to run required validators
    }).exec();
    // 2. Redirect them to store with flash
    req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store</a>`);
    res.redirect(`/stores/${store._id}/edit`);
};

exports.getStoreBySlug = async (req, res, next) => {
    const store = await Store.findOne({
        slug: req.params.slug
    }).populate('author reviews'); // Find associated author record

    // If there are no stores
    if (!store) {
        return next();
    }

    res.render('store', {
        store,
        title: store.name
    })
};

exports.getStoresByTag = async (req, res) => {
    const tag = req.params.tag;
    const tagQuery = tag || { $exists: true };

    const tagsPromise = Store.getTagsList();
    const storesPromise = Store.find({tags: tagQuery});  

    // Destructure result from promises
    const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);

    res.render('tag', { tags, title: 'Tags', tag, stores });
};

exports.searchStores = async (req, res) => {
    const stores = await Store
    .find({
        $text: {
            $search: req.query.q
        }
    }, { // Project a score
        score: { $meta: 'textScore' }
    })
    .sort({
        score: { $meta: 'textScore' }
    })
    .limit(5);
    
    res.json(stores);
};

exports.mapStores = async (req, res) => {
    const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
    const q = {
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates
                },
                $maxDistance: 10000 // 10km
            }
        }
    };

    const stores = await Store.find(q).select('slug name description location photo').limit(10); // Limit to closest 10

    res.json(stores);
};

exports.mapPage = (req, res) => {
    res.render('map', { title: 'Map' });
};

exports.heartStore = async (req, res) => {
    const hearts = req.user.hearts.map(obj => obj.toString());
    const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
    const user = await User.findByIdAndUpdate(req.user._id, 
        { [operator]: { hearts: req.params.id } },
        { new: true }
    );
    res.json(user);
};

exports.getHearts = async (req, res) => {
    const stores = await Store.find({
        _id: { $in: req.user.hearts }
    });
    res.render('stores', { title: 'Hearted Stores', stores });
};

exports.getTopStores = async (req, res) => {
    const stores = await Store.getTopStores();
    res.render('topStores', { title: 'Top Stores', stores });
};