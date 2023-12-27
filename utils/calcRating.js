const Review = require("../models/Review")

module.exports = async (id,) => {
    const reviews = await Review.find({ productId: id }, 'rating');
    if (reviews.length === 0) return 0;
    const length = reviews.length;
    let sum = 0;
    reviews.map((review) => sum += review.rating);
    return (sum / length).toFixed(1);
}