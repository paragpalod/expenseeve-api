'use strict';

module.exports = function (Schema) {
  const Session = new Schema({
    token: {
      type: String
    },
    expiresIn: {
      type: Number,
      required: true
    },
    userID: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    metadata: {
      type: String
    },
    deletedAt: {
      type: Date
    }
  }, { timestamps: true });

  return Session;
};
