'use strict';

var errorHandler = function (err, req, res, next) {
  if (err.stack) {
    if (err.stack) {console.log(err.stack);}
    console.trace();
  }
  console.log(err);
  res.status(400).send(err.message);
}

exports.errorHandler = errorHandler;