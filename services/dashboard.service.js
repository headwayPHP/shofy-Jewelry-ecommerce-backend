const Product = require('../model/Products');
const Order = require('../model/Order');
// const User = require('../model/User');
const Review = require('../model/Review');
const User = require('../model/Admin');
const Banner = require('../model/Banner');
const Category = require('../model/Category');

exports.getAdminDashboardDataService = async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    let [
        totalProducts,
        totalEnquiries,
        todayEnquiries,
        totalCustomers,
        last10Products,
        recentEnquiries,
        todaysReviews,
    ] = await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        Order.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
        User.countDocuments({ role: 'customer' }), // adjust role name as per your system
        Product.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('category', 'category_name')
            .lean(),
        Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name')
            .lean(),
        Review.find({ createdAt: { $gte: todayStart, $lte: todayEnd } }),

    ]);

    last10Products = last10Products.map(product => {
        const { category, ...rest } = product;
        return {
            category: category?.category_name || null,
            ...rest,
        };
    });

    recentEnquiries = recentEnquiries.map(enquiry => {
        const { user, ...rest } = enquiry;
        return {
            userName: user?.name || null,
            ...rest,
        };
    });




    return {
        stats: {
            totalProducts,
            totalEnquiries,
            todayEnquiries,
            totalCustomers
        },
        last10Products,
        recentEnquiries,
        todaysReviews,

    };
};

// exports.getDashboardDataService = async (adminUserId) => {
//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);

//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     try {
//         const [
//             banners,
//             categories,
//             allProducts,
//             totalProductsCount,
//             totalEnquiriesCount,
//             todayEnquiriesCount,
//             totalCustomersCount,
//             last10Products,
//             recentEnquiries,
//             todaysReviews,
//             adminProfile
//         ] = await Promise.all([
//             Banner.find({}).sort({ createdAt: 1 }),
//             Category.find({ status: 'Show' }).sort({ createdAt: -1 }).populate('products'),
//             Product.find({ status: 'Show' })
//                 .sort({ createdAt: -1 })
//                 .limit(8)
//                 .populate('category metal_type rate purity'),
//             Product.countDocuments(),
//             Order.countDocuments(),
//             Order.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
//             User.countDocuments({ role: 'customer' }), // Assuming role is a field in User
//             Product.find({}).sort({ createdAt: -1 }).limit(10),
//             Order.find({}).sort({ createdAt: -1 }).limit(10),
//             Review.find({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
//             User.findById(adminUserId)
//         ]);

//         return {
//             banners,
//             categories,
//             products: allProducts,
//             stats: {
//                 totalProductsCount,
//                 totalEnquiriesCount,
//                 todayEnquiriesCount,
//                 totalCustomersCount,
//             },
//             last10Products,
//             recentEnquiries,
//             todaysReviews,
//             adminProfile,
//         };
//     } catch (error) {
//         throw error;
//     }
// };


exports.getDashboardDataService = async () => {
    // Banner.find({ status: 'Show' }).sort({ order: 1 }),
    try {
        // Fetch all data in parallel for better performance
        const [banners, categories, products] = await Promise.all([
            Banner.find({}).sort({ createdAt: 1 }),
            Category.find({ status: 'Show' }).sort({ createdAt: -1 }).populate('products'),
            Product.find({ status: 'Show' })
                .sort({ createdAt: -1 })
                .limit(8)
                .populate('category metal_type rate purity'),
        ]);

        return {
            banners,
            categories,
            products,
        };
    } catch (error) {
        throw error;
    }
};