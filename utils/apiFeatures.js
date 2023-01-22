class APIFeatures {
    constructor(query, queryString) {
      //query is from mongodb, queryString is from route
      this.query = query;
      this.queryString = queryString;
    }
  
    filter() {
      //1A. FILTERING => remove unwanted & unnecessary terms entered by user
      const queryObj = { ...this.queryString }; //create copy of query fields
      const excludedFields = ['page', 'sort', 'limit', 'fields']; //shouldnt be there in query strings
      excludedFields.forEach((el) => delete queryObj[el]); //delete each element of exFld present in queryObj
  
      // console.log(req.query, queryObj);
  
      //1B. ADVANCED FILTERING => implement gte, gt, lte, lt functionality in db
      let queryStr = JSON.stringify(queryObj); //convert obj to str
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
      // console.log(JSON.parse(queryStr));// parse back to json object
  
      // let query = Tour.find(JSON.parse(queryStr));
      this.query = this.query.find(JSON.parse(queryStr));
  
      return this;
    }
  
    sort() {
      //2. SORTING
      if (this.queryString.sort) {
        // query = query.sort(this.queryString.sort);//if sort=price this line will work but not for multiple sorting values
        const sortBy = this.queryString.sort.split(',').join(' '); //separate comma values in the req query of
        //sort field into space separated
        // console.log(sortBy);
        this.query = this.query.sort(sortBy);
      } else {
        this.query = this.query.sort('-createdAt');
      }
  
      return this;
    }
  
    limitFields() {
      //3. LIMITING FIELDS=> SHOWING USER SPECIFIC SELECTED DATA
      if (this.queryString.fields) {
        const fields = this.queryString.fields.split(',').join(' '); //same as sort method requirements
        this.query = this.query.select(fields);
      } else {
        //below can be used in schema as well by setting select: false to not show that property
        this.query = this.query.select('-__v'); //dont show __v property if user didnt specify any limiting field
      }
  
      return this;
    }
  
    paginate() {
      //4. PAGINATION => IMPLEMENT NHI HORHA HAI KAFI TRY KARLIA (-1) HTANE SE BHI NI HORA😭
      if (this.queryString.page || this.queryString.limit) {
        let page = Number(this.queryString.page) || 1; //convert string to num by multipying by 1 & take 1 if user didnt specify page
        let limit = Number(this.queryString.limit) || 3;
        let skip = (page - 1) * limit;
  
        // query.skip(10).limit(10) if page = 2 & limit = 10
        this.query = this.query.skip(skip).limit(limit);
      }
  
      return this;
    }
  }

  module.exports = APIFeatures;