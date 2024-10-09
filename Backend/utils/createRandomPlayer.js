// List of possible player names and cosmetics
const randomNames = [
  "Alice", "Bob", "Charlie", "Diana", "Ethan",
  "Fiona", "George", "Hannah", "Isaac", "Jasmine",
  "Liam", "Mia", "Noah", "Olivia", "Paul",
  "Quinn", "Riley", "Sophia", "Tyler", "Victoria"
];

const randomAchievements = [
  "First Kill", "Level Up", "Collector", "Sharpshooter", 
  "Explorer", "Master Strategist", "Challenge Accepted",
  "Victory Royale", "Ultimate Team Player", "Legendary Status"
];

const randomCosmetics = [
  "Golden Crown", "Mystic Wings", "Shadow Cloak", 
  "Dragon Armor", "Elemental Sword", "Celestial Shield", 
  "Inferno Blade", "Phantom Mask", "Enchanted Staff", 
  "Frostbite Gauntlets", "Hero's Cape", "Samurai Armor"
];

// Function to get a random element from an array
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Function to create a random player
const createRandomPlayer = () => {
  // Generate random player data
  const name = getRandomElement(randomNames);
  const email = `${name.toLowerCase().replace(/\s+/g, '')}@example.com`; // Email based on the player's name
  const score = Math.floor(Math.random() * 10000); // Random score between 0 and 10000
  const rank = new mongoose.Types.ObjectId(); // Assuming rank is created elsewhere and has an ID

  // Create a random player object
  const player = {
    name,
    email,
    score,
    rank,
    achievements: [],
    friends: []
  };

  // Create random achievements for the player
  const achievementsToCreate = Math.floor(Math.random() * 5); // Random number of achievements (0-4)
  for (let i = 0; i < achievementsToCreate; i++) {
    const achievement = {
      achievement_name: getRandomElement(randomAchievements),
      date_earned: new Date(),
      cosmetic: getRandomElement(randomCosmetics)
    };
    player.achievements.push(achievement);
  }

  // Create random friends for the player
  const friendsToCreate = Math.floor(Math.random() * 3); // Random number of friends (0-2)
  for (let i = 0; i < friendsToCreate; i++) {
    // Assuming friend IDs are generated or provided elsewhere
    const friendId = new mongoose.Types.ObjectId(); // Mocking friend ID
    player.friends.push(friendId);
  }
  return player;
};

createRandomPlayer();