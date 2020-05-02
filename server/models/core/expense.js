module.exports = function (Schema) {
  const Expense = new Schema({
    itemName: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    userID: {
      type: Schema.Types.ObjectId,
      required: true
    },
    categoryID: {
      type: Schema.Types.ObjectId,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    deletedAt: {
      type: Number,
      default: null
    }
  }, { timestamps: true });

  return Expense;
};
