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

//GET ALL TOURS
exports.getAllTours = async (req, res) => {
  try {
    //THE LAST => EXECUTE QUERY
    const query = Tour.find({});
    const tours = await query;

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
      message: "couldnt find the tour"
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

