module.exports = function (Schema) {
  const User = new Schema({
    username: {
      required: true,
      type: String,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    hashedPassword: {
      type: String
    },
    salt: {
      type: String
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntill: {
      type: Date
    },
    totalBudget: {
      type: Number
    }
  }, { timestamps: true });

  return User;
};
