module.exports = fn => {//catch async errors
    return (req, res, next) => {
      fn(req, res, next).catch(next);
    }
  }