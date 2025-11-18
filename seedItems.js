// utils/seedItems.js
require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('../models/Item');
const User = require('../models/User');
const connectDB = require('../config/db');

const dummyItems = [
  // Kolar items
  {
    name: 'Canon EOS 1500D Camera',
    description: 'Professional DSLR camera with 18-55mm lens. Perfect for photography enthusiasts. Well maintained and clean.',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
    rentPerHour: 50,
    location: {
      address: 'KGF Road, Kolar',
      city: 'Kolar',
      coordinates: {
        type: 'Point',
        coordinates: [78.1294, 13.1368]
      }
    },
    condition: 'Like New',
    depositAmount: 5000
  },
  {
    name: 'Power Drill Set',
    description: 'Complete power drill set with 50+ drill bits and accessories. Suitable for home repairs and DIY projects.',
    category: 'Tools',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
    rentPerHour: 20,
    location: {
      address: 'Gandhi Nagar, Kolar',
      city: 'Kolar',
      coordinates: {
        type: 'Point',
        coordinates: [78.1400, 13.1400]
      }
    },
    condition: 'Good',
    depositAmount: 1000
  },
  
  // Bangalore items
  {
    name: 'Gaming Laptop - ASUS ROG',
    description: 'High-performance gaming laptop with RTX 3060, 16GB RAM. Perfect for gaming and video editing.',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400',
    rentPerHour: 70,
    location: {
      address: 'Indiranagar, Bangalore',
      city: 'Bangalore',
      coordinates: {
        type: 'Point',
        coordinates: [77.6408, 12.9716]
      }
    },
    condition: 'Like New',
    depositAmount: 10000
  },
  {
    name: 'Professional DJ Equipment',
    description: 'Complete DJ setup with mixer, turntables, and speakers. Ideal for parties and events.',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400',
    rentPerHour: 100,
    location: {
      address: 'Koramangala, Bangalore',
      city: 'Bangalore',
      coordinates: {
        type: 'Point',
        coordinates: [77.6309, 12.9352]
      }
    },
    condition: 'Good',
    depositAmount: 15000
  },

  // Mumbai items
  {
    name: 'GoPro Hero 11',
    description: 'Latest GoPro action camera with 4K video and waterproof casing. Perfect for adventures.',
    category: 'Electronics',
    imageUrl: 'https://images.expertreviews.co.uk/wp-content/uploads/2022/11/gopro_hero_11_black_13_0.jpg',
    rentPerHour: 45,
    location: {
      address: 'Bandra West, Mumbai',
      city: 'Mumbai',
      coordinates: {
        type: 'Point',
        coordinates: [72.8281, 19.0596]
      }
    },
    condition: 'New',
    depositAmount: 8000
  },
  {
    name: 'Surfboard',
    description: 'Professional surfboard, perfect for beginners and intermediate surfers.',
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=400',
    rentPerHour: 35,
    location: {
      address: 'Juhu Beach, Mumbai',
      city: 'Mumbai',
      coordinates: {
        type: 'Point',
        coordinates: [72.8267, 19.0990]
      }
    },
    condition: 'Good',
    depositAmount: 3000
  },

  // Delhi items
  {
    name: 'Electric Scooter',
    description: 'Ather 450X electric scooter for quick city commutes. Fully charged and ready to go.',
    category: 'Vehicles',
    imageUrl: 'https://bd.gaadicdn.com/processedimages/ather-energy/450x/source/450x6074072baa1ae.jpg?tr=w-820,h-495',
    rentPerHour: 80,
    location: {
      address: 'Connaught Place, Delhi',
      city: 'Delhi',
      coordinates: {
        type: 'Point',
        coordinates: [77.2167, 28.6292]
      }
    },
    condition: 'Like New',
    depositAmount: 5000
  },
  {
    name: 'Wedding Photography Kit',
    description: 'Complete photography kit with 2 cameras, lenses, tripod, and lighting. Professional grade.',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=400',
    rentPerHour: 150,
    location: {
      address: 'Saket, Delhi',
      city: 'Delhi',
      coordinates: {
        type: 'Point',
        coordinates: [77.2090, 28.5244]
      }
    },
    condition: 'Good',
    depositAmount: 20000
  },

  // Hyderabad items
  {
    name: 'Pressure Washer',
    description: 'High-pressure washer for car and home cleaning. 2000 PSI power.',
    category: 'Appliances',
    imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400',
    rentPerHour: 30,
    location: {
      address: 'Banjara Hills, Hyderabad',
      city: 'Hyderabad',
      coordinates: {
        type: 'Point',
        coordinates: [78.4482, 17.4239]
      }
    },
    condition: 'Good',
    depositAmount: 2000
  },
  {
    name: 'Badminton Court Equipment',
    description: 'Complete badminton setup with net, rackets, and shuttlecocks.',
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400',
    rentPerHour: 25,
    location: {
      address: 'Gachibowli, Hyderabad',
      city: 'Hyderabad',
      coordinates: {
        type: 'Point',
        coordinates: [78.3489, 17.4399]
      }
    },
    condition: 'Good',
    depositAmount: 1000
  },

  // Pune items
  {
    name: 'Camping Tent (6 Person)',
    description: 'Large 6-person camping tent with rain cover. Perfect for group outdoor adventures.',
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400',
    rentPerHour: 40,
    location: {
      address: 'Koregaon Park, Pune',
      city: 'Pune',
      coordinates: {
        type: 'Point',
        coordinates: [73.8956, 18.5362]
      }
    },
    condition: 'Like New',
    depositAmount: 2500
  },
  {
    name: 'Lawn Mower',
    description: 'Electric lawn mower for garden maintenance. Easy to use and efficient.',
    category: 'Tools',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    rentPerHour: 25,
    location: {
      address: 'Aundh, Pune',
      city: 'Pune',
      coordinates: {
        type: 'Point',
        coordinates: [73.8075, 18.5590]
      }
    },
    condition: 'Good',
    depositAmount: 1500
  },

  // Chennai items
  {
    name: 'PlayStation 5',
    description: 'Sony PS5 with 2 controllers and 5 popular games. Perfect for gaming weekend.',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
    rentPerHour: 60,
    location: {
      address: 'T Nagar, Chennai',
      city: 'Chennai',
      coordinates: {
        type: 'Point',
        coordinates: [80.2337, 13.0418]
      }
    },
    condition: 'Like New',
    depositAmount: 8000
  },
  {
    name: 'Projector with Screen',
    description: 'Full HD projector with 100-inch screen. Perfect for movie nights or presentations.',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400',
    rentPerHour: 45,
    location: {
      address: 'Velachery, Chennai',
      city: 'Chennai',
      coordinates: {
        type: 'Point',
        coordinates: [80.2207, 12.9750]
      }
    },
    condition: 'Good',
    depositAmount: 3500
  },

  // Mysore item
  {
    name: 'Bicycle - Mountain Bike',
    description: '21-speed mountain bike, perfect for weekend rides and fitness.',
    category: 'Vehicles',
    imageUrl: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400',
    rentPerHour: 10,
    location: {
      address: 'Gokulam, Mysore',
      city: 'Mysore',
      coordinates: {
        type: 'Point',
        coordinates: [76.6394, 12.2958]
      }
    },
    condition: 'Good',
    depositAmount: 500
  }
];

async function seedItems() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Find or create a dummy user as the owner
    let owner = await User.findOne({ email: 'owner@commshare.com' });
    if (!owner) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      owner = await User.create({
        username: 'DemoOwner',
        email: 'owner@commshare.com',
        password: hashedPassword,
        isVerified: true
      });
      console.log('Created dummy owner user');
    }

    // Clear existing items
    await Item.deleteMany({});
    console.log('Cleared existing items');

    // Add owner info to items
    const itemsWithOwner = dummyItems.map(item => ({
      ...item,
      owner: owner._id,
      ownerName: owner.username,
      ownerContact: owner.email,
      available: true
    }));

    // Insert items
    const insertedItems = await Item.insertMany(itemsWithOwner);
    console.log(`✅ Successfully seeded ${insertedItems.length} items`);

    console.log('\nSeeded items:');
    insertedItems.forEach(item => {
      console.log(`- ${item.name} (${item.category}) - ₹${item.rentPerHour}/hr at ${item.location.city}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

// Run the seeder
seedItems();
