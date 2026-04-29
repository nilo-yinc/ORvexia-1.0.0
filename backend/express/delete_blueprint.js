const mongoose = require('mongoose');
const Blueprint = require('./src/models/blueprint-model');
require('dotenv').config();

async function deleteBP() {
  try {
    await mongoose.connect("mongodb+srv://niloy:Niloy%402004@hacknitr.f87q2ts.mongodb.net/orvexia?appName=HackNITR");
    await Blueprint.findByIdAndDelete('69f263684a819d417916de81');
    console.log('Deleted the old ORvexia User blueprint.');
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}
deleteBP();
