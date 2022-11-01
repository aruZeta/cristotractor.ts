export const onlyPhrases = {
  $project: { _id: 0, phrases: 1 }
};

export const onlyPhraseAndId = {
  $project: { _id: 1, phrase: 1 }
};

export const toPhrases = {
  $lookup: {
    from: "phrases",
    localField: "phrases",
    foreignField: "_id",
    pipeline: [onlyPhraseAndId],
    as: "phrases",
  },
};

export const toStringArr = [{
  $unwind: { path: "$phrases" }
}, {
  $group: {
    _id: null,
    phrases: { $push: "$phrases.phrase" },
    ids: { $push: "$phrases._id" },
  }
}];

export const toLimitedSizeArr = [{
  $addFields: { subArraySize: 25 }
}, {
  $addFields: {
    startingIndices: { $range: [0, { $size: "$phrases" }, "$subArraySize"] }
  }
}, {
  $project: {
    _id: 0,
    phrases: {
      $map: {
        input: "$startingIndices",
        as: "i",
        in: { $slice: ["$phrases", "$$i", "$subArraySize"] }
      }
    },
    ids: {
      $map: {
        input: "$startingIndices",
        as: "i",
        in: { $slice: ["$ids", "$$i", "$subArraySize"] }
      }
    }
  }
}];
