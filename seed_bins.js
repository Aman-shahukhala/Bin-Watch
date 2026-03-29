const mongoose = require('mongoose');
const Bin = require('./src/models/Bin');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dustbin_db';

async function seed() {
  await mongoose.connect(mongoURI);
  console.log("Connected to MongoDB...");

  // Clear existing (optional - commented out for safety)
  // await Bin.deleteMany({ id: { $regex: /^MOCK-/ } });

  const mockBins = [
    // Street Bins (GPS)
    { id: 'MOCK-GPS-01', nickname: 'North Gate Depot', binType: 'street', lat: 27.7145, lng: 85.3305, fill_percent: 45, binHeight: 100 },
    { id: 'MOCK-GPS-02', nickname: 'Student Parking', binType: 'street', lat: 27.7125, lng: 85.3285, fill_percent: 15, binHeight: 80 },
    { id: 'MOCK-GPS-03', nickname: 'Main Entrance GPS', binType: 'street', lat: 27.7133, lng: 85.3293, fill_percent: 88, binHeight: 120 },

    // Indoor Bins (Ground Floor)
    { id: 'MOCK-IND-G01', nickname: 'Lecture Hall A', binType: 'indoor', floor: 'Ground', x: 280, y: 350, fill_percent: 62, binHeight: 50 },
    { id: 'MOCK-IND-G02', nickname: 'Computer Science Lab', binType: 'indoor', floor: 'Ground', x: 750, y: 650, fill_percent: 10, binHeight: 50 },

    // Indoor Bins (1st Floor)
    { id: 'MOCK-IND-F01', nickname: 'Faculty Lounge', binType: 'indoor', floor: '1st', x: 450, y: 250, fill_percent: 92, binHeight: 40 },
    { id: 'MOCK-IND-F02', nickname: 'Quiet Study Zone', binType: 'indoor', floor: '1st', x: 150, y: 800, fill_percent: 25, binHeight: 40 }
  ];

  for (const bData of mockBins) {
    // Generate some mock history
    const history = [];
    const now = new Date();
    for (let i = 24; i >= 0; i--) {
        const hTime = new Date(now.getTime() - i * 3600000);
        history.push({
            time: hTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: hTime,
            fill: Math.max(0, bData.fill_percent - (i * 2) + Math.random() * 5)
        });
    }

    await Bin.findOneAndUpdate(
      { id: bData.id },
      { ...bData, history, last_seen: new Date(), last_updated: new Date().toLocaleTimeString() },
      { upsert: true }
    );
    console.log(`Seeded: ${bData.nickname}`);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
