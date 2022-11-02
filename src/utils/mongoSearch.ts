export const onlyPhrases = {
  $project: { _id: 0, phrases: 1 }
};

export const onlyPhrase = {
  $project: { _id: 0, phrase: 1 }
};

export const onlyPhraseAndId = {
  $project: { _id: 1, phrase: 1 }
};

export const idsToPhrases = (
  localPath: string,
  filter: any,
) => ({
  $lookup: {
    from: "phrases",
    localField: localPath,
    foreignField: "_id",
    pipeline: [filter],
    as: "phrases",
  }
});

export const groupBy = (
  pathPhrase: string,
  pathId: string,
  includeIds: boolean = true,
) => ({
  $group: {
    _id: null,
    phrases: { $push: pathPhrase },
    ...(includeIds ? { ids: { $push: pathId } } : 0),
  }
});

export const toStringArr = (
  includeIds: boolean = true,
  pathPhrase: string = "$phrases.phrase",
  pathId: string = "$phrases._id",
) => [
    { $unwind: { path: "$phrases" } },
    groupBy(pathPhrase, pathId, includeIds)
  ];

export const toLimitedSizeArr = (
  includeIds: boolean = true,
) => [{
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
    ...(includeIds ? {
      ids: {
        $map: {
          input: "$startingIndices",
          as: "i",
          in: { $slice: ["$ids", "$$i", "$subArraySize"] }
        }
      }
    } : {}),
  }
}];

export const matchingPhrasesFromLetter = (
  letter: string
) => ({
  $lookup: {
    from: "letters",
    as: "phrases",
    let: { vals: "$phrases" },
    pipeline: [{
      $match: { letter: letter }
    }, {
      $project: {
        _id: 0,
        phrases: {
          $map: {
            input: "$phrases",
            as: "pID",
            in: {
              $cond: {
                if: { $in: ["$$pID", "$$vals"] },
                then: "$$pID",
                else: null
              }
            }
          }
        }
      }
    }],
  }
});

export const toPhrasesArray = (
  localPath: string,
  filter: any,
  includeIds: boolean = true,
) => [
    idsToPhrases(localPath, filter),
    ...toStringArr(includeIds),
    ...toLimitedSizeArr(includeIds),
  ]

export const getRandomPhrase = (
  path: string
) => [
    { $unwind: { path: path } },
    { $sample: { size: 1 } },
  ];
