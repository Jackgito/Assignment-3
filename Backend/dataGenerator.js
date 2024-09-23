const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Player = require('./models/player');
const Cosmetic = require('./models/cosmetic');
const Achievement = require('./models/achievement');
const Rank = require('./models/rank');
const Friend = require('./models/friend');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection failed', error);
    process.exit(1);
  }
};

// Dummy data for the database
const seedData = async () => {
  // Clear existing data
  await Player.deleteMany();
  await Cosmetic.deleteMany();
  await Achievement.deleteMany();
  await Rank.deleteMany();
  await Friend.deleteMany();

  // Seed rank data (5 entities)
  const ranks = await Rank.insertMany([
    { rank_name: 'Bronze', points_required: 1000 },
    { rank_name: 'Silver', points_required: 3000 },
    { rank_name: 'Gold', points_required: 6000 },
    { rank_name: 'Platinum', points_required: 10000 },
    { rank_name: 'Diamond', points_required: 15000 },
  ]);

  // Seed cosmetic data (5 entities)
  const cosmetics = await Cosmetic.insertMany([
    { name: 'Red Hat', category: 'Headwear', rarity: 'Common', release_date: new Date('2022-01-15') },
    { name: 'Golden Sword', category: 'Weapon', rarity: 'Legendary', release_date: new Date('2023-03-21') },
    { name: 'Leather Boots', category: 'Footwear', rarity: 'Uncommon', release_date: new Date('2021-11-10') },
    { name: 'Silver Armor', category: 'Armor', rarity: 'Rare', release_date: new Date('2022-06-25') },
    { name: 'Blue Cape', category: 'Backwear', rarity: 'Epic', release_date: new Date('2023-05-15') },
  ]);

  // Seed player data (5 entities)
  const players = await Player.insertMany([
    { name: 'Alice', email: 'alice@example.com', score: 1500, rank: ranks[0]._id },
    { name: 'Bob', email: 'bob@example.com', score: 3500, rank: ranks[1]._id },
    { name: 'Charlie', email: 'charlie@example.com', score: 7000, rank: ranks[2]._id },
    { name: 'Daisy', email: 'daisy@example.com', score: 12000, rank: ranks[3]._id },
    { name: 'Eve', email: 'eve@example.com', score: 16000, rank: ranks[4]._id },
  ]);

  // Seed achievement data (5 entities)
  const achievements = await Achievement.insertMany([
    { player: players[0]._id, cosmetic: cosmetics[0]._id, achievement_name: 'First Cosmetic Collected', date_earned: new Date() },
    { player: players[1]._id, cosmetic: cosmetics[1]._id, achievement_name: 'Legendary Collector', date_earned: new Date() },
    { player: players[2]._id, cosmetic: cosmetics[2]._id, achievement_name: 'Boots of Speed', date_earned: new Date() },
    { player: players[3]._id, cosmetic: cosmetics[3]._id, achievement_name: 'Armor Master', date_earned: new Date() },
    { player: players[4]._id, cosmetic: cosmetics[4]._id, achievement_name: 'Cape Crusader', date_earned: new Date() },
  ]);

  // Seed friends data (5 entities)
  const friends = await Friend.insertMany([
    { player_id_1: players[0]._id, player_id_2: players[1]._id },
    { player_id_1: players[1]._id, player_id_2: players[2]._id },
    { player_id_1: players[2]._id, player_id_2: players[3]._id },
    { player_id_1: players[3]._id, player_id_2: players[4]._id },
    { player_id_1: players[4]._id, player_id_2: players[0]._id },
  ]);

  console.log('Data successfully seeded');
  process.exit();
};

// Connect to DB and run the seeding function
connectDB().then(seedData);