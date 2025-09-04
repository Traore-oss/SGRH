const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ mongoDB connecté avec succès');
  } catch (error) {
    console.error('❌ mongoDB non connecté :', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
