Jackgito: Update create.js so the EU returns the player in same format as read.js

GitHub Copilot: ### Plan

1. **Extract Common Formatting Logic**: Create a helper function to format player data in the same way as 

read.js

.
2. **Update EU Logic**: Use the new helper function to format the player data before returning the response.

### Pseudocode

1. Create a helper function `formatPlayerData` that formats player data.
2. Update the EU logic in the [`router.post('/:region')`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FJuise%2FDesktop%2FKoulu%2FDI%20kurssit%2FData%20intensive%20systems%2FAssignment%203%2FBackend%2Froutes%2Fcreate.js%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A1%2C%22character%22%3A6%7D%7D%2C%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FJuise%2FDesktop%2FKoulu%2FDI%20kurssit%2FData%20intensive%20systems%2FAssignment%203%2FBackend%2Froutes%2Fread.js%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A1%2C%22character%22%3A6%7D%7D%5D%2C%221fb60732-2a10-4ff3-9efb-7df983db295f%22%5D "Go to definition") route to use `formatPlayerData`.

### Code

#### Helper Function
Add the helper function `formatPlayerData` to 

create.js

:

```javascript
const formatPlayerData = (player) => ({
  _id: player._id,
  name: player.name,
  email: player.email,
  score: player.score,
  rank: {
    _id: player.rank._id,
    rank_name: player.rank.rank_name,
    points_required: player.rank.points_required,
    __v: 0,
  },
  cosmetics: player.cosmetics,
  achievements: player.achievements.map(achievement => ({
    ...achievement,
    date_earned: new Date(achievement.date_earned).toISOString().split('T')[0],
  })),
  friends: player.friends.map(friend => friend.name),
});
```

#### Update EU Logic
Update the EU logic in the [`router.post('/:region')`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FJuise%2FDesktop%2FKoulu%2FDI%20kurssit%2FData%20intensive%20systems%2FAssignment%203%2FBackend%2Froutes%2Fcreate.js%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A1%2C%22character%22%3A6%7D%7D%2C%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FJuise%2FDesktop%2FKoulu%2FDI%20kurssit%2FData%20intensive%20systems%2FAssignment%203%2FBackend%2Froutes%2Fread.js%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A1%2C%22character%22%3A6%7D%7D%5D%2C%221fb60732-2a10-4ff3-9efb-7df983db295f%22%5D "Go to definition") route to use `formatPlayerData`:

```javascript
router.post('/:region', async (req, res) => {
  const { region } = req.params;

  try {
    // Generate a random player
    const randomPlayer = await generateRandomPlayer();

    if (region.toLowerCase() === 'eu') {
      // EU (MongoDB) logic remains the same
      const savedPlayer = await randomPlayer.save();
      if (randomPlayer.friends && randomPlayer.friends.length > 0) {
        await Promise.all(randomPlayer.friends.map(async (friend) => {
          await Player.updateOne(
            { _id: friend.friend_id },
            { $push: { friends: { friend_id: savedPlayer._id, name: savedPlayer.name } } }
          );
        }));
      }

      const formattedPlayer = formatPlayerData(savedPlayer);

      res.status(201).json({
        message: 'New player created for EU',
        player: formattedPlayer,
      });
    } else if (region.toLowerCase() === 'na' || region.toLowerCase() === 'asia') {
      // Use the appropriate pool based on the region
      const pool = region.toLowerCase() === 'na' ? NApool : ASIApool;
  
      // Determine the rank_id based on the score
      const rank_id = getRankIdByScore(randomPlayer.score);
  
      // Insert new player into Postgres (NA or Asia)
      const playerResult = await pool.query(
        `INSERT INTO players (name, email, score, rank_id) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, name, email, score, rank_id`,
        [randomPlayer.name, randomPlayer.email, randomPlayer.score, rank_id]
      );
  
      const newPlayer = playerResult.rows[0];
  
      // Insert achievements into the achievements table
      await Promise.all(randomPlayer.achievements.map(async (achievement) => {
        await pool.query(
          `INSERT INTO achievements (player_id, achievement_name, condition, date_earned)
          VALUES ($1, $2, $3, $4)`,
          [newPlayer.id, achievement.achievement_name, achievement.condition, achievement.date_earned]
        );
      }));
  
      // Insert cosmetics into the cosmetics table
      await pool.query(
        `INSERT INTO cosmetics (player_id, items) VALUES ($1, $2)`,
        [newPlayer.id, randomPlayer.cosmetics] // Save cosmetics as a JSON array
      );
  
      // Get the total number of rows in the friends table
      const { rows: friendRows } = await pool.query('SELECT id FROM players WHERE id != $1', [newPlayer.id]);
      const totalFriends = friendRows.length;
  
      const selectedFriendIds = new Set(); // Use a Set to store unique IDs
      const numFriendsToAdd = 1; // Only one friend
  
      if (totalFriends > 0) { // Check if there are any friends to choose from
        while (selectedFriendIds.size < numFriendsToAdd) {
          const randomIndex = Math.floor(Math.random() * totalFriends);
          const selectedId = friendRows[randomIndex].id;
  
          // Ensure it's not the player themselves and not already selected
          if (selectedId !== newPlayer.id) {
            selectedFriendIds.add(selectedId);
          }
        }
      }
  
      // Insert selected friends into the friends table with the new player
      await Promise.all([...selectedFriendIds].map(async (friendId) => {
        await pool.query(
          `INSERT INTO friends (player_id_1, player_id_2) VALUES ($1, $2)`,
          [newPlayer.id, friendId]
        );
      }));
  
      // Fetch the related data (achievements, cosmetics, and friends)
      const achievementsResult = await pool.query(
        `SELECT * FROM achievements WHERE player_id = $1`, [newPlayer.id]
      );
      const cosmeticsResult = await pool.query(
        `SELECT * FROM cosmetics WHERE player_id = $1`, [newPlayer.id]
      );
      const friendsResult = await pool.query(
        `SELECT f.player_id_1, f.player_id_2, p1.name AS player1_name, p2.name AS player2_name
        FROM friends f
        LEFT JOIN players p1 ON f.player_id_1 = p1.id
        LEFT JOIN players p2 ON f.player_id_2 = p2.id
        WHERE f.player_id_1 = $1 OR f.player_id_2 = $1`, [newPlayer.id]
      );
  
      // Format the friends data to return the correct friend name
      const formattedFriends = friendsResult.rows.map(friend => {
        const friendName = friend.player_id_1 === newPlayer.id
          ? friend.player2_name || "Deleted player"
          : friend.player1_name || "Deleted player";
        return { name: friendName };
      });
        
      res.status(201).json({
        player: {
          _id: newPlayer.id,
          name: newPlayer.name,
          email: newPlayer.email,
          score: newPlayer.score,
          rank: {
            _id: newPlayer.rank_id,
            rank_name: randomPlayer.rank.rank_name,
            points_required: randomPlayer.rank.points_required,
            __v: 0,
          },
          achievements: achievementsResult.rows.map(achievement => ({
            ...achievement,
            date_earned: new Date(achievement.date_earned).toISOString().split('T')[0],
          })),
          cosmetics: cosmeticsResult.rows[0].items,
          friends: formattedFriends,
        },
      });
    } else {
      res.status(400).json({ error: 'Invalid region specified.' });
    }
  } catch (err) {
    console.error('Error creating new player:', err);
    res.status(500).json({ message: 'Error creating new player' });
  }
});
```

### Full Updated 

create.js



```javascript
const express = require('express');
const router = express.Router();
const Player = require('../models/player');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Postgres connection pools for NA and Asia
const NApool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  password: process.env.PG_PASSWORD,
  database: process.env.NA_PG_NAME,
  port: process.env.PG_PORT,
});

const ASIApool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  password: process.env.PG_PASSWORD,
  database: process.env.ASIA_PG_NAME,
  port: process.env.PG_PORT,
});

const generateUniqueEmail = async () => {
  const names = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'Eve', 'Mallory', 'Trent'];
  const domains = ['example.com', 'mail.com', 'test.com'];

  let uniqueEmailFound = false;
  let randomEmail = '';

  while (!uniqueEmailFound) {
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    randomEmail = `${randomName.toLowerCase()}${Math.floor(Math.random() * 10000)}@${randomDomain}`;

    // Check if this email already exists
    const existingPlayer = await Player.findOne({ email: randomEmail });
    if

 (!

existingPlayer) {
      uniqueEmailFound = true;
    }
  }

  return randomEmail;
};

const generateRandomAchievements = () => {
  // Array of funny achievement names
  const achievementNames = [
    'Master of Goat Slaying', 
    'Stealth Ninja Extraordinaire', 
    'Dungeon Delver Supreme', 
    'Dark Lord Slayer', 
    'Coin Collector of the Century',
    'The Goat Whisperer',
    'Invisible Victory',
    'Treasure Hoarder',
    'Dungeon Explorer',
    'Slayer of the Unholy',
    'Epic Loot Gatherer',
    'Master of Disguises',
    'Ultimate Coin Farmer',
    'The Lost Dungeon Runner',
    'Ghost Hunter Extraordinaire',
    'The Stealthy One',
    'Potion Brewer Master',
    'Collecting All the Things',
    'Cat Lover in a Dungeon',
    'Eternal Coin Pouch',
  ];

  // Generate random achievements for the player
  const numAchievements = Math.floor(Math.random() * 3) + 1; // 1 to 3 achievements
  const achievements = [];

  for (let i = 0; i < numAchievements; i++) {
    const achievement_name = achievementNames[Math.floor(Math.random() * achievementNames.length)];
    achievements.push({
      achievement_name,
      condition: `Completed some epic quest`, // Use a generic condition for simplicity
      date_earned: new Date(), // Current date for simplicity
    });
  }

  return achievements;
};

const generateRandomCosmetics = () => {
  const cosmeticItems = ['Cape', 'Sword', 'Helmet', 'Boots', 'Shield'];

  // Randomly assign between 1 and 3 cosmetics to the player
  const numCosmetics = Math.floor(Math.random() * 3) + 1;
  const cosmetics = [];

  for (let i = 0; i < numCosmetics; i++) {
    const item = cosmeticItems[Math.floor(Math.random() * cosmeticItems.length)];
    cosmetics.push(item);
  }

  return cosmetics;
};

const generateRandomFriends = async () => {
  // Fetch all players except the current player
  const allPlayers = await Player.find();

  // Handle case where there are no other players
  if (allPlayers.length === 0) { return [] };

  // Generate a random number of friends (0 to 2)
  const numFriends = Math.floor(Math.random() * 3); 
  const friends = [];

  for (let i = 0; i < numFriends; i++) {
    const randomFriend = allPlayers[Math.floor(Math.random() * allPlayers.length)];

    // Add the selected friend to the current player's friends list
    friends.push({
      friend_id: randomFriend._id,
      name: randomFriend.name,
    });
  }

  return friends;
};

const getRankByScore = (score) => {
  switch (true) {
    case score >= 15000:
      return { rank_name: 'Diamond', points_required: 15000 };
    case score >= 10000:
      return { rank_name: 'Platinum', points_required: 10000 };
    case score >= 6000:
      return { rank_name: 'Gold', points_required: 6000 };
    case score >= 3000:
      return { rank_name: 'Silver', points_required: 3000 };
    default:
      return { rank_name: 'Bronze', points_required: 1000 };
  }
};

const getRankIdByScore = (score) => {
  switch (true) {
    case score >= 15000:
      return 5; // Diamond
    case score >= 10000:
      return 4; // Platinum
    case score >= 6000:
      return 3; // Gold
    case score >= 3000:
      return 2; // Silver
    case score >= 1000:
      return 1; // Bronze
    default:
      return 1; // Default to Bronze for scores below 1000
  }
};

const generateRandomPlayer = async () => {
  const playerTags = [
    'Faker', 'Doublelift', 'xQcOW', 'Summit1G', 'N0tail',
    'S1mple', 'Shroud', 'HikaruGM', 'Ninja', 'DrLupo',
    'ZywOo', 'Mang0', 'Bugha', 'BoxBox', 'Scarra',
    'Tyler1', 'ChocoTaco', 'Tfue', 'TenZ', 'PewPewU'
  ];

  const email = await generateUniqueEmail();
  const score = Math.floor(Math.random() * 20001);
  const rank = getRankByScore(score); // Determine rank based on score
  const friends = await generateRandomFriends();

  // Pick a random player tag
  let playerTag = playerTags[Math.floor(Math.random() * playerTags.length)];

  // 25% chance to add a random number to the end of the player tag
  if (Math.random() < 0.25) {
    const randomNumber = Math.floor(Math.random() * 20000) + 1;
    playerTag += randomNumber;
  }

  // Generate random achievements, cosmetics
  const achievements = generateRandomAchievements();
  const cosmetics = generateRandomCosmetics();

  // Create the player object first so they have an ID
  const newPlayer = new Player({
    name: playerTag,
    email: email,
    score: score,
    rank: rank,
    achievements: achievements,
    cosmetics: cosmetics,
    friends: friends
  });

  return newPlayer;
};

const formatPlayerData = (player) => ({
  _id: player._id,
  name: player.name,
  email: player.email,
  score: player.score,
  rank: {
    _id: player.rank._id,
    rank_name: player.rank.rank_name,
    points_required: player.rank.points_required,
    __v: 0,
  },
  cosmetics: player.cosmetics,
  achievements: player.achievements.map(achievement => ({
    ...achievement,
    date_earned: new Date(achievement.date_earned).toISOString().split('T')[0],
  })),
  friends: player.friends.map(friend => friend.name),
});

// Route to create a new player
router.post('/:region', async (req, res) => {
  const { region } = req.params;

  try {
    // Generate a random player
    const randomPlayer = await generateRandomPlayer();

    if (region.toLowerCase() === 'eu') {
      // EU (MongoDB) logic remains the same
      const savedPlayer = await randomPlayer.save();
      if (randomPlayer.friends && randomPlayer.friends.length > 0) {
        await Promise.all(randomPlayer.friends.map(async (friend) => {
          await Player.updateOne(
            { _id: friend.friend_id },
            { $push: { friends: { friend_id: savedPlayer._id, name: savedPlayer.name } } }
          );
        }));
      }

      const formattedPlayer = formatPlayerData(savedPlayer);

      res.status(201).json({
        message: 'New player created for EU',
        player: formattedPlayer,
      });
    } else if (region.toLowerCase() === 'na' || region.toLowerCase() === 'asia') {
      // Use the appropriate pool based on the region
      const pool = region.toLowerCase() === 'na' ? NApool : ASIApool;
  
      // Determine the rank_id based on the score
      const rank_id = getRankIdByScore(randomPlayer.score);
  
      // Insert new player into Postgres (NA or Asia)
      const playerResult = await pool.query(
        `INSERT INTO players (name, email, score, rank_id) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, name, email, score, rank_id`,
        [randomPlayer.name, randomPlayer.email, randomPlayer.score, rank_id]
      );
  
      const newPlayer = playerResult.rows[0];
  
      // Insert achievements into the achievements table
      await Promise.all(randomPlayer.achievements.map(async (achievement) => {
        await pool.query(
          `INSERT INTO achievements (player_id, achievement_name, condition, date_earned)
          VALUES ($1, $2, $3, $4)`,
          [newPlayer.id, achievement.achievement_name, achievement.condition, achievement.date_earned]
        );
      }));
  
      // Insert cosmetics into the cosmetics table
      await pool.query(
        `INSERT INTO cosmetics (player_id, items) VALUES ($1, $2)`,
        [newPlayer.id, randomPlayer.cosmetics] // Save cosmetics as a JSON array
      );
  
      // Get the total number of rows in the friends table
      const { rows: friendRows } = await pool.query('SELECT id FROM players WHERE id != $1', [newPlayer.id]);
      const totalFriends = friendRows.length;
  
      const selectedFriendIds = new Set(); // Use a Set to store unique IDs
      const numFriendsToAdd = 1; // Only one friend
  
      if (totalFriends > 0) { // Check if there are any friends to choose from
        while (selectedFriendIds.size < numFriendsToAdd) {
          const randomIndex = Math.floor(Math.random() * totalFriends);
          const selectedId = friendRows[randomIndex].id;
  
          // Ensure it's not the player themselves and not already selected
          if (selectedId !== newPlayer.id) {
            selectedFriendIds.add(selectedId);
          }
        }
      }
  
      // Insert selected friends into the friends table with the new player
      await Promise.all([...selectedFriendIds].map(async (friendId) => {
        await pool.query(
          `INSERT INTO friends (player_id_1, player_id_2) VALUES ($1, $2)`,
          [newPlayer.id, friendId]
        );
      }));
  
      // Fetch the related data (achievements, cosmetics, and friends)
      const achievementsResult = await pool.query(
        `SELECT * FROM achievements WHERE player_id = $1`, [newPlayer.id]
      );
      const cosmeticsResult = await pool.query(
        `SELECT * FROM cosmetics WHERE player_id = $1`, [newPlayer.id]
      );
      const friendsResult = await pool.query(
        `SELECT f.player_id_1, f.player_id_2, p1.name AS player1_name, p2.name AS player2_name
        FROM friends f
        LEFT JOIN playersconst express = require('express');
const router = express.Router();
const Player = require('../models/player');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Postgres connection pools for NA and Asia
const NApool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  password: process.env.PG_PASSWORD,
  database: process.env.NA_PG_NAME,
  port: process.env.PG_PORT,
});

const ASIApool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  password: process.env.PG_PASSWORD,
  database: process.env.ASIA_PG_NAME,
  port: process.env.PG_PORT,
});

const generateUniqueEmail = async () => {
  const names = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'Eve', 'Mallory', 'Trent'];
  const domains = ['example.com', 'mail.com', 'test.com'];

  let uniqueEmailFound = false;
  let randomEmail = '';

  while (!uniqueEmailFound) {
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    randomEmail = `${randomName.toLowerCase()}${Math.floor(Math.random() * 10000)}@${randomDomain}`;

    // Check if this email already exists
    const existingPlayer = await Player.findOne({ email: randomEmail });
    ifexistingPlayer) {
      uniqueEmailFound = true;
    }
  }

  return randomEmail;
};

const generateRandomAchievements = () => {
  // Array of funny achievement names
  const achievementNames = [
    'Master of Goat Slaying', 
    'Stealth Ninja Extraordinaire', 
    'Dungeon Delver Supreme', 
    'Dark Lord Slayer', 
    'Coin Collector of the Century',
    'The Goat Whisperer',
    'Invisible Victory',
    'Treasure Hoarder',
    'Dungeon Explorer',
    'Slayer of the Unholy',
    'Epic Loot Gatherer',
    'Master of Disguises',
    'Ultimate Coin Farmer',
    'The Lost Dungeon Runner',
    'Ghost Hunter Extraordinaire',
    'The Stealthy One',
    'Potion Brewer Master',
    'Collecting All the Things',
    'Cat Lover in a Dungeon',
    'Eternal Coin Pouch',
  ];

  // Generate random achievements for the player
  const numAchievements = Math.floor(Math.random() * 3) + 1; // 1 to 3 achievements
  const achievements = [];

  for (let i = 0; i < numAchievements; i++) {
    const achievement_name = achievementNames[Math.floor(Math.random() * achievementNames.length)];
    achievements.push({
      achievement_name,
      condition: `Completed some epic quest`, // Use a generic condition for simplicity
      date_earned: new Date(), // Current date for simplicity
    });
  }

  return achievements;
};

const generateRandomCosmetics = () => {
  const cosmeticItems = ['Cape', 'Sword', 'Helmet', 'Boots', 'Shield'];

  // Randomly assign between 1 and 3 cosmetics to the player
  const numCosmetics = Math.floor(Math.random() * 3) + 1;
  const cosmetics = [];

  for (let i = 0; i < numCosmetics; i++) {
    const item = cosmeticItems[Math.floor(Math.random() * cosmeticItems.length)];
    cosmetics.push(item);
  }

  return cosmetics;
};

const generateRandomFriends = async () => {
  // Fetch all players except the current player
  const allPlayers = await Player.find();

  // Handle case where there are no other players
  if (allPlayers.length === 0) { return [] };

  // Generate a random number of friends (0 to 2)
  const numFriends = Math.floor(Math.random() * 3); 
  const friends = [];

  for (let i = 0; i < numFriends; i++) {
    const randomFriend = allPlayers[Math.floor(Math.random() * allPlayers.length)];

    // Add the selected friend to the current player's friends list
    friends.push({
      friend_id: randomFriend._id,
      name: randomFriend.name,
    });
  }

  return friends;
};

const getRankByScore = (score) => {
  switch (true) {
    case score >= 15000:
      return { rank_name: 'Diamond', points_required: 15000 };
    case score >= 10000:
      return { rank_name: 'Platinum', points_required: 10000 };
    case score >= 6000:
      return { rank_name: 'Gold', points_required: 6000 };
    case score >= 3000:
      return { rank_name: 'Silver', points_required: 3000 };
    default:
      return { rank_name: 'Bronze', points_required: 1000 };
  }
};

const getRankIdByScore = (score) => {
  switch (true) {
    case score >= 15000:
      return 5; // Diamond
    case score >= 10000:
      return 4; // Platinum
    case score >= 6000:
      return 3; // Gold
    case score >= 3000:
      return 2; // Silver
    case score >= 1000:
      return 1; // Bronze
    default:
      return 1; // Default to Bronze for scores below 1000
  }
};

const generateRandomPlayer = async () => {
  const playerTags = [
    'Faker', 'Doublelift', 'xQcOW', 'Summit1G', 'N0tail',
    'S1mple', 'Shroud', 'HikaruGM', 'Ninja', 'DrLupo',
    'ZywOo', 'Mang0', 'Bugha', 'BoxBox', 'Scarra',
    'Tyler1', 'ChocoTaco', 'Tfue', 'TenZ', 'PewPewU'
  ];

  const email = await generateUniqueEmail();
  const score = Math.floor(Math.random() * 20001);
  const rank = getRankByScore(score); // Determine rank based on score
  const friends = await generateRandomFriends();

  // Pick a random player tag
  let playerTag = playerTags[Math.floor(Math.random() * playerTags.length)];

  // 25% chance to add a random number to the end of the player tag
  if (Math.random() < 0.25) {
    const randomNumber = Math.floor(Math.random() * 20000) + 1;
    playerTag += randomNumber;
  }

  // Generate random achievements, cosmetics
  const achievements = generateRandomAchievements();
  const cosmetics = generateRandomCosmetics();

  // Create the player object first so they have an ID
  const newPlayer = new Player({
    name: playerTag,
    email: email,
    score: score,
    rank: rank,
    achievements: achievements,
    cosmetics: cosmetics,
    friends: friends
  });

  return newPlayer;
};

const formatPlayerData = (player) => ({
  _id: player._id,
  name: player.name,
  email: player.email,
  score: player.score,
  rank: {
    _id: player.rank._id,
    rank_name: player.rank.rank_name,
    points_required: player.rank.points_required,
    __v: 0,
  },
  cosmetics: player.cosmetics,
  achievements: player.achievements.map(achievement => ({
    ...achievement,
    date_earned: new Date(achievement.date_earned).toISOString().split('T')[0],
  })),
  friends: player.friends.map(friend => friend.name),
});

// Route to create a new player
router.post('/:region', async (req, res) => {
  const { region } = req.params;

  try {
    // Generate a random player
    const randomPlayer = await generateRandomPlayer();

    if (region.toLowerCase() === 'eu') {
      // EU (MongoDB) logic remains the same
      const savedPlayer = await randomPlayer.save();
      if (randomPlayer.friends && randomPlayer.friends.length > 0) {
        await Promise.all(randomPlayer.friends.map(async (friend) => {
          await Player.updateOne(
            { _id: friend.friend_id },
            { $push: { friends: { friend_id: savedPlayer._id, name: savedPlayer.name } } }
          );
        }));
      }

      const formattedPlayer = formatPlayerData(savedPlayer);

      res.status(201).json({
        message: 'New player created for EU',
        player: formattedPlayer,
      });
    } else if (region.toLowerCase() === 'na' || region.toLowerCase() === 'asia') {
      // Use the appropriate pool based on the region
      const pool = region.toLowerCase() === 'na' ? NApool : ASIApool;
  
      // Determine the rank_id based on the score
      const rank_id = getRankIdByScore(randomPlayer.score);
  
      // Insert new player into Postgres (NA or Asia)
      const playerResult = await pool.query(
        `INSERT INTO players (name, email, score, rank_id) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, name, email, score, rank_id`,
        [randomPlayer.name, randomPlayer.email, randomPlayer.score, rank_id]
      );
  
      const newPlayer = playerResult.rows[0];
  
      // Insert achievements into the achievements table
      await Promise.all(randomPlayer.achievements.map(async (achievement) => {
        await pool.query(
          `INSERT INTO achievements (player_id, achievement_name, condition, date_earned)
          VALUES ($1, $2, $3, $4)`,
          [newPlayer.id, achievement.achievement_name, achievement.condition, achievement.date_earned]
        );
      }));
  
      // Insert cosmetics into the cosmetics table
      await pool.query(
        `INSERT INTO cosmetics (player_id, items) VALUES ($1, $2)`,
        [newPlayer.id, randomPlayer.cosmetics] // Save cosmetics as a JSON array
      );
  
      // Get the total number of rows in the friends table
      const { rows: friendRows } = await pool.query('SELECT id FROM players WHERE id != $1', [newPlayer.id]);
      const totalFriends = friendRows.length;
  
      const selectedFriendIds = new Set(); // Use a Set to store unique IDs
      const numFriendsToAdd = 1; // Only one friend
  
      if (totalFriends > 0) { // Check if there are any friends to choose from
        while (selectedFriendIds.size < numFriendsToAdd) {
          const randomIndex = Math.floor(Math.random() * totalFriends);
          const selectedId = friendRows[randomIndex].id;
  
          // Ensure it's not the player themselves and not already selected
          if (selectedId !== newPlayer.id) {
            selectedFriendIds.add(selectedId);
          }
        }
      }
  
      // Insert selected friends into the friends table with the new player
      await Promise.all([...selectedFriendIds].map(async (friendId) => {
        await pool.query(
          `INSERT INTO friends (player_id_1, player_id_2) VALUES ($1, $2)`,
          [newPlayer.id, friendId]
        );
      }));
  
      // Fetch the related data (achievements, cosmetics, and friends)
      const achievementsResult = await pool.query(
        `SELECT * FROM achievements WHERE player_id = $1`, [newPlayer.id]
      );
      const cosmeticsResult = await pool.query(
        `SELECT * FROM cosmetics WHERE player_id = $1`, [newPlayer.id]
      );
      const friendsResult = await pool.query(
        `SELECT f.player_id_1, f.player_id_2, p1.name AS player1_name, p2.name AS player2_name
        FROM friends f
        LEFT JOIN players

Jackgito: Fix:
      const savedPlayer = await randomPlayer.save();
      if (randomPlayer.friends && randomPlayer.friends.length > 0) {
        await Promise.all(randomPlayer.friends.map(async (friend) => {
          await Player.updateOne(
            { _id: friend.friend_id },
            { $push: { friends: { friend_id: savedPlayer._id, name: savedPlayer.name } } }
          );
        }));
      }

      savedPlayer.friends = savedPlayer.friends.map(friend => friend.name);

GitHub Copilot: ### Plan
1. Ensure proper indentation and formatting.
2. Verify that [`randomPlayer.save()`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FJuise%2FDesktop%2FKoulu%2FDI%20kurssit%2FData%20intensive%20systems%2FAssignment%203%2FBackend%2Froutes%2Fcreate.js%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A209%2C%22character%22%3A32%7D%7D%5D%2C%22bddd8dae-8801-43a1-a0de-1efd76cc4b73%22%5D "Go to definition") is awaited correctly.
3. Check that [`randomPlayer.friends`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FJuise%2FDesktop%2FKoulu%2FDI%20kurssit%2FData%20intensive%20systems%2FAssignment%203%2FBackend%2Froutes%2Fcreate.js%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A209%2C%22character%22%3A32%7D%7D%5D%2C%22bddd8dae-8801-43a1-a0de-1efd76cc4b73%22%5D "Go to definition") is properly checked for existence and length.
4. Ensure [`Promise.all`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FJuise%2FDesktop%2FKoulu%2FDI%20kurssit%2FData%20intensive%20systems%2FAssignment%203%2FBackend%2Froutes%2Fcreate.js%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A211%2C%22character%22%3A14%7D%7D%5D%2C%22bddd8dae-8801-43a1-a0de-1efd76cc4b73%22%5D "Go to definition") is used correctly with [`map`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FJuise%2FDesktop%2FKoulu%2FDI%20kurssit%2FData%20intensive%20systems%2FAssignment%203%2FBackend%2Froutes%2Fcreate.js%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A211%2C%22character%22%3A47%7D%7D%5D%2C%22bddd8dae-8801-43a1-a0de-1efd76cc4b73%22%5D "Go to definition").
5. Confirm that [`Player.updateOne`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FJuise%2FDesktop%2FKoulu%2FDI%20kurssit%2FData%20intensive%20systems%2FAssignment%203%2FBackend%2Froutes%2Fcreate.js%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A212%2C%22character%22%3A16%7D%7D%5D%2C%22bddd8dae-8801-43a1-a0de-1efd76cc4b73%22%5D "Go to definition") is called with correct parameters.
6. Ensure [`savedPlayer.friends`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FJuise%2FDesktop%2FKoulu%2FDI%20kurssit%2FData%20intensive%20systems%2FAssignment%203%2FBackend%2Froutes%2Fcreate.js%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A209%2C%22character%22%3A12%7D%7D%5D%2C%22bddd8dae-8801-43a1-a0de-1efd76cc4b73%22%5D "Go to definition") is mapped correctly to extract [`name`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FJuise%2FDesktop%2FKoulu%2FDI%20kurssit%2FData%20intensive%20systems%2FAssignment%203%2FBackend%2Froutes%2Fcreate.js%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A214%2C%22character%22%3A62%7D%7D%5D%2C%22bddd8dae-8801-43a1-a0de-1efd76cc4b73%22%5D "Go to definition").

### Fixed Code
```javascript
const savedPlayer = await randomPlayer.save();
if (randomPlayer.friends && randomPlayer.friends.length > 0) {
  await Promise.all(randomPlayer.friends.map(async (friend) => {
    await Player.updateOne(
      { _id: friend.friend_id },
      { $push: { friends: { friend_id: savedPlayer._id, name: savedPlayer.name } } }
    );
  }));
}

savedPlayer.friends = savedPlayer.friends.map(friend => friend.name);
```

Jackgito: Add success message:
res.status(201);

GitHub Copilot: ### Plan
1. Add a success message to the response.
2. Use the `json` method to send a response with a status code and message.

### Updated Code
```javascript
res.status(201).json({ message: 'Player created successfully' });
```

Jackgito: Create readme file for this codebase

Workspace: # Project Title

This project is a full-stack application that includes a backend built with Node.js, Express, and MongoDB, and a frontend built with React and Vite.

## Table of Contents

- [Project Title](#project-title)
- [Table of Contents](#table-of-contents)
- [Getting Started](#getting-started)
  - Prerequisites
  - Installation
- [Running the Application](#running-the-application)
  - Backend
  - Frontend
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Frontend Components](#frontend-components)
- Styling
- Linting
- License

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB
- PostgreSQL

### Installation

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd <repository-directory>
    ```

2. Install dependencies for both backend and frontend:
    ```sh
    cd Backend
    npm install
    cd ../Frontend
    npm install
    ```

## Running the Application

### Backend

1. Create a [`.env`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FJuise%2FDesktop%2FKoulu%2FDI%20kurssit%2FData%20intensive%20systems%2FAssignment%203%2F.gitignore%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A1%2C%22character%22%3A1%7D%7D%5D%2C%22904efc5f-3aa7-41ac-b4f9-24782cd1dd5b%22%5D "Go to definition") file in the 

Backend

 directory with the following content:
    ```env
    MONGO_URI=<your-mongodb-uri>
    PG_USER=<your-postgres-user>
    PG_HOST=<your-postgres-host>
    PG_PASSWORD=<your-postgres-password>
    NA_PG_NAME=<your-na-postgres-db-name>
    ASIA_PG_NAME=<your-asia-postgres-db-name>
    PG_PORT=<your-postgres-port>
    PORT=5000
    ```

2. Start the backend server:
    ```sh
    cd Backend
    npm start
    ```

### Frontend

1. Start the frontend development server:
    ```sh
    cd Frontend
    npm run dev
    ```

## Project Structure

```
.gitignore
Backend/
    .env
    models/
        player.js
    package.json
    routes/
        create.js
        delete.js
        read.js
    server.js
    utils/
        createRandomPlayer.js
Frontend/
    eslint.config.js
    index.html
    package.json
    public/
    src/
        App.css
        App.jsx
        DataDisplay.jsx
        index.css
        main.jsx
    vite.config.js
```

## API Endpoints

### Create a New Player

- **URL:** `/api/create/:region`
- **Method:** `POST`
- **Description:** Creates a new player in the specified region (EU, NA, or Asia).

### Read Player Data

- **URL:** `/api/read`
- **Method:** `GET`
- **Description:** Retrieves player data.

### Delete a Player

- **URL:** `/api/delete/:id`
- **Method:** `DELETE`
- **Description:** Deletes a player by ID.

## Frontend Components

### 

DataDisplay.jsx



- Renders a table of player data.
- Conditionally renders an "Actions" column based on the [`showDetails`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FJuise%2FDesktop%2FKoulu%2FDI%20kurssit%2FData%20intensive%20systems%2FAssignment%203%2FFrontend%2Fsrc%2FDataDisplay.jsx%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A94%2C%22character%22%3A15%7D%7D%5D%2C%22904efc5f-3aa7-41ac-b4f9-24782cd1dd5b%22%5D "Go to definition") prop.

### [`App.jsx`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FJuise%2FDesktop%2FKoulu%2FDI%20kurssit%2FData%20intensive%20systems%2FAssignment%203%2FFrontend%2Fsrc%2Fmain.jsx%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A2%2C%22character%22%3A19%7D%7D%5D%2C%22904efc5f-3aa7-41ac-b4f9-24782cd1dd5b%22%5D "Go to definition")
