// const fs = require("fs");
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));//JSON.parse() creates JS Object

// exports.checkId = (req, res, next, val) => {//extra 4th arg for id param
//   console.log(`Tour id is ${val}`);

//   if (val * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }
//   next();
// }

// exports.checkBody = (req, res, next) => {
//   const {name, price} = req.body;
//   if (!name || !price) {
//     return res.status(400).json({
//       status: "fail",
//       message: "Missing name or price"
//     })
//   }
//   next();
// }

const Tour = require("./../models/tourModel");
const APIFeatures = require("./../utils/apiFeatures");

exports.aliasTours = (req, res, next) => {
  req.query.limit = "8";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,difficulty,summary";
  next();
}

//GET ALL TOURS
exports.getAllTours = async (req, res) => {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
    //THE LAST => EXECUTE QUERY
    // const query = Tour.find({});
    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "couldnt find any tour"
    })
  }
}

//CREATE NEW TOUR
exports.createTour = async (req, res) => {
  try {
    console.log(req.body)
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });

  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err
    })
  }
}

//GET SPECIFIC TOUR
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    //OR Tour.findOne({ _id: req.params.id })

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "couldnt find the tour"
    })
  }
}

//UPDATE TOUR
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true//runs validator every time on update
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err
    })
  }
    
}

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err
    })
  }
    
}

exports.getTourStats = async (req, res) => {
  try {//consists array of stages where every stage is an object
    const stats = await Tour.aggregate([
      {
        $match: {ratingsAverage: {$gte: 4.5}}//select as per field specified
      },
      {
        $group: {
          // _id: "$ratingsAverage",
          _id: {$toUpper: "$difficulty"},//groups tours with easy, medium & difficult fields and provides corresponding values like avgPrice,minPrice.maxPrice etc
          numTour: {$sum : 1},//calc total tours, 1 val for each mongodb document that will go through this pipeline
          numRatings: {$sum: "$ratingsQuantity"},
          avgRating: {$avg: "$ratingsAverage"},
          avgPrice: {$avg: "$price"},
          minPrice: {$min: "$price"},
          maxPrice: {$max: "$price"}
        }
      },
      {
        $sort: {avgPrice: 1}
      },
      // {
      //   $match: {_id: {$ne: "EASY"}}
      // }
      
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err
    })
  }
}

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;//2021

    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates"
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {$month: "$startDates"},
          numTourStarts: {$sum: 1},
          tours: {$push: "$name"}
        }
      },
      {
        $addFields: {month: "$_id"}
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: {numTourStarts: -1}
      },
      {
        $limit: 12
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err
    })
  }
}
