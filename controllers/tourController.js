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
    //BELOW METHODS ARE PROVIDED BY MONGOOSE
    // const tours = await Tour.find().where("difficulty").equals("easy").where("duration").equals("5");

    //1A. FILTERING => remove unwanted & unnecessary terms entered by user
    const queryObj = { ...req.query };//create copy of query fields
    const excludedFields = ["page", "sort", "limit", "fields"];//shouldnt be there in query strings
    excludedFields.forEach(el => delete queryObj[el]);//delete each element of exFld present in queryObj
  
    console.log(req.query, queryObj);

    //1B. ADVANCED FILTERING => implement gte, gt, lte, lt functionality in db
    let queryStr = JSON.stringify(queryObj);//convert obj to str
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
    console.log(JSON.parse(queryStr));// parse back to json object
    
    let query = Tour.find(JSON.parse(queryStr));

    //2. SORTING
    if (req.query.sort) {
      // query = query.sort(req.query.sort);//if sort=price this line will work but not for multiple sorting values
      const sortBy = req.query.sort.split(",").join(" ");//separate comma values in the req query of 
      //sort field into space separated 
      console.log(sortBy);
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    //3. LIMITING FIELDS=> SHOWING USER SPECIFIC SELECTED DATA
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");//same as sort method requirements
      query = query.select(fields);
    } else {
      //below can be used in schema as well by setting select: false to not show that property
      query = query.select("-__v");//dont show __v property if user didnt specify any limiting field
    }
    
    //4. PAGINATION => IMPLEMENT NHI HORHA HAI KAFI TRY KARLIA (-1) HTANE SE BHI NI HORA😭
    let page = Number(req.query.page) || 1;//convert string to num by multipying by 1 & take 1 if user didnt specify page
    let limit = Number(req.query.limit) || 3;
    let skip = (page - 1) * limit;

    // query.skip(10).limit(10) if page = 2 & limit = 10
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const totalTours = await Tour.countDocuments();
      if (skip >= totalTours) throw new Error("This page does not exist!");
    } 
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

