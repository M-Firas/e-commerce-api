const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please provide product name"],
      maxlength: [100, "Name can not be more than 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Please provide product description"],
      maxlength: [1000, "Description can not be more than 1000 characters"],
    },
    image: {
      type: String,
      default: "/uploads/example.jpeg",
    },
    gender: {
      type: String,
      required: [true, "please provide gender"],
      enum: ["men", "women", "kids"]
    },
    category: {
      type: String,
      required: [true, "Please provide product category"],
      enum: ["shirts", "shoes", "pants", "hoodies and sweatshirts", "jackets", "accessories"],
    },
    // season: {
    //   type: String,
    //   enum: ["default", "summer", "winter", "fall", "spring"],
    //   default: "default"
    // },
    company: {
      type: String,
      required: [true, "Please provide company"],
      enum: {
        values: ["adidas", "puma", "nike", "american eagle", "h&m", "pull & bear", "zara", "bershka", "new balance"],
        message: "{VALUE} is not supported",
      },
    },
    colors: {
      type: [String],
      default: ["#222"],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    newArrivels: {
      type: Boolean,
      default: false,
    },
    atSale: {
      type: Boolean,
      default: false,
    },
    salePrice: {
      type: Number,
      // Validate salePrice only if atSale is true
      validate: {
        validator: function (value) {
          // If atSale is true, salePrice must be provided and be less than the original price
          if (this.atSale && (!value || value >= this.price)) {
            return false;
          }
          return true;
        },
        message: 'Sale price must be less than the original price if product is on sale',
      },
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);


ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
});


ProductSchema.pre("remove", async function (next) {
  await this.model("Review").deleteMany({ product: this._id });
});

module.exports = mongoose.model("Product", ProductSchema);
