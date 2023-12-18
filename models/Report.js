const { Schema, model } = require("mongoose");

const ReportSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: [true, "User Id Is Required"] },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: [true, "Product Id Is Required"] },
    content: { type: String, required: [true, "Report Content Is Required"] },
}, { timestamps: true })

module.exports = model('Report', ReportSchema);