module.exports = function (Schema) {
  const Category = new Schema({
    name: {
      type: String,
      required: true
    },
    userID: {
      type: Schema.Types.ObjectId,
      required: true
    },
    deletedAt: {
      type: Number,
      default: null
    }
  }, { timestamps: true });

  Category.index({ name: 1, userID: 1 }, { unique: true });

  return Category;
};
