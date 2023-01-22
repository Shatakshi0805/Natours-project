const express = require("express");
const tourController = require("./../controllers/tourController");

const router = express.Router();//similar to app except mini app for specific route of tour

// router.param("id", tourController.checkId);

router.route("/top-5-cheap").get(tourController.aliasTours, tourController.getAllTours);

router.route("/").get(tourController.getAllTours).post(tourController.createTour);
router.route("/:id").get(tourController.getTour).patch(tourController.updateTour).delete(tourController.deleteTour);

module.exports = router;