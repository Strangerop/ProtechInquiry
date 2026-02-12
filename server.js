require('dotenv').config();
// server.js - Node.js Express API with MongoDB
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// Multer Configuration (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Middleware
app.use(cors());
// Note: body-parser middleware can sometimes interfere with multer if not careful, 
// but usually it just ignores multipart/form-data.
// To be safe, we can limit it to JSON/URLencoded content types or just rely on Express built-in parser 
// if we were on a newer version, but here we keep it as is since it should work.
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(__dirname));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/customer_details_db';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Root route handler
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Request logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Customer Schema (Existing)
const customerSchema = new mongoose.Schema({
  cardFront: { type: String }, // Made optional
  cardBack: { type: String },  // Made optional
  name: { type: String, required: true, trim: true },
  companyName: { type: String, trim: true }, // Made optional
  mobileNumber: { type: String, required: true },
  whatsappNumber: { type: String }, // Made optional
  email: { type: String, required: true, lowercase: true, trim: true },
  requirement: { type: String, enum: ['EMS', 'BMS', 'Other', 'Lead'] }, // Added 'Lead' option
  requirementDescription: { type: String, trim: true },
  otherRequirement: { type: String, trim: true },
  priority: { type: String, enum: ['Normal', 'Imp', 'Most Imp', 'Urgent'], default: 'Normal' },
  visitDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // Fields from Lead schema (merged)
  photoUrl: { type: String },
  type: { type: String, enum: ['Customer', 'Lead'], default: 'Customer' }
});

// Create indexes for faster queries
customerSchema.index({ email: 1 });
customerSchema.index({ mobileNumber: 1 });
customerSchema.index({ createdAt: -1 });

const Customer = mongoose.model('Customer', customerSchema, 'user');

// Lead Schema (merged into Customer logic effectively, but keeping separate model for tailored operations if needed)
// Actually, we can just use the same collection.
const leadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  mobileNumber: { type: String, required: true },
  photoUrl: { type: String }, // Cloudinary URL
  cardFront: { type: String },
  cardBack: { type: String },
  priority: { type: String, enum: ['Normal', 'Imp', 'Most Imp', 'Urgent'], default: 'Normal' },
  createdAt: { type: Date, default: Date.now },
  type: { type: String, default: 'Lead' } // Force type 'Lead'
});

const Lead = mongoose.model('Lead', leadSchema, 'user');

// Helper function to upload buffer to Cloudinary
const uploadFromBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'leads' },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// API Routes

// Create new lead with dual image upload support
app.post('/api/leads', upload.fields([{ name: 'cardFront', maxCount: 1 }, { name: 'cardBack', maxCount: 1 }]), async (req, res) => {
  try {
    console.log("DEBUG: Incoming request to /api/leads (multipart)");
    const { name, email, mobileNumber, priority } = req.body;

    if (!name || !email || !mobileNumber) {
      return res.status(400).json({ success: false, message: 'Name, email, and mobile number are required.' });
    }

    let cardFrontUrl = '';
    let cardBackUrl = '';

    if (req.files) {
      if (req.files.cardFront) {
        console.log("DEBUG: Uploading cardFront to Cloudinary...");
        const result = await uploadFromBuffer(req.files.cardFront[0].buffer);
        cardFrontUrl = result.secure_url;
      }
      if (req.files.cardBack) {
        console.log("DEBUG: Uploading cardBack to Cloudinary...");
        const result = await uploadFromBuffer(req.files.cardBack[0].buffer);
        cardBackUrl = result.secure_url;
      }
    }

    const lead = new Lead({
      name,
      email,
      mobileNumber,
      photoUrl: cardFrontUrl, // Keep legacy photoUrl for compatibility
      cardFront: cardFrontUrl,
      cardBack: cardBackUrl,
      priority: priority || 'Normal',
      type: 'Lead'
    });

    await lead.save();
    res.status(201).json({
      success: true,
      message: 'Lead submitted successfully',
      data: lead
    });

  } catch (error) {
    console.error('Error saving lead:', error);
    res.status(500).json({ success: false, message: 'Failed to save lead', error: error.message });
  }
});

// Update lead with dual image support
app.put('/api/leads/:id', upload.fields([{ name: 'cardFront', maxCount: 1 }, { name: 'cardBack', maxCount: 1 }]), async (req, res) => {
  try {
    const { name, email, mobileNumber, priority, visitDate, whatsappNumber, companyName, requirement, requirementDescription, otherRequirement } = req.body;
    let updateData = {
      name,
      email,
      mobileNumber,
      priority,
      visitDate,
      whatsappNumber,
      companyName,
      requirement,
      requirementDescription,
      otherRequirement,
      updatedAt: Date.now()
    };

    if (req.files) {
      if (req.files.cardFront) {
        console.log("DEBUG: New cardFront detected for update.");
        const result = await uploadFromBuffer(req.files.cardFront[0].buffer);
        updateData.cardFront = result.secure_url;
        updateData.photoUrl = result.secure_url; // Sync legacy field
      }
      if (req.files.cardBack) {
        console.log("DEBUG: New cardBack detected for update.");
        const result = await uploadFromBuffer(req.files.cardBack[0].buffer);
        updateData.cardBack = result.secure_url;
      }
    }

    const lead = await Customer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.json({ success: true, message: 'Lead updated successfully', data: lead });

  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ success: false, message: 'Failed to update lead', error: error.message });
  }
});

// Get all leads
app.get('/api/leads', async (req, res) => {
  try {
    const { priority } = req.query;
    // User requested "list of all the users" in leads tab.
    // So we remove the type constraint or make it optional.
    // Let's fetch all documents from the User collection (which Lead model points to).
    const query = {};

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: leads
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leads',
      error: error.message
    });
  }
});

// Get single lead by ID
app.get('/api/leads/:id', async (req, res) => {
  try {
    // Use Customer model to get ALL fields, as "Leads" list now contains both types.
    const lead = await Customer.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead/Customer not found'
      });
    }

    res.json({
      success: true,
      data: lead
    });

  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead',
      error: error.message
    });
  }
});

// Create new customer with dual image upload support (Cloudinary)
app.post('/api/customers', upload.fields([{ name: 'cardFront', maxCount: 1 }, { name: 'cardBack', maxCount: 1 }]), async (req, res) => {
  try {
    const {
      name,
      companyName,
      mobileNumber,
      whatsappNumber,
      email,
      requirement,
      requirementDescription,
      otherRequirement,
      priority,
      visitDate
    } = req.body;

    // Validation
    if (!name || !companyName || !mobileNumber || !email || !requirement) {
      return res.status(400).json({ success: false, message: 'Required text fields are missing.' });
    }

    let cardFrontUrl = '';
    let cardBackUrl = '';

    if (req.files) {
      if (req.files.cardFront) {
        console.log("DEBUG: Uploading customer cardFront to Cloudinary...");
        const result = await uploadFromBuffer(req.files.cardFront[0].buffer);
        cardFrontUrl = result.secure_url;
      }
      if (req.files.cardBack) {
        console.log("DEBUG: Uploading customer cardBack to Cloudinary...");
        const result = await uploadFromBuffer(req.files.cardBack[0].buffer);
        cardBackUrl = result.secure_url;
      }
    }

    // Validation for images (if they are still considered required)
    if (!cardFrontUrl || !cardBackUrl) {
      // Note: User prompt says "Images must be uploaded to Cloudinary", implying they are required.
      // Adjusting validation to match requirements.
      return res.status(400).json({ success: false, message: 'Both cardFront and cardBack images are required.' });
    }

    // Create new customer document
    const customer = new Customer({
      cardFront: cardFrontUrl,
      cardBack: cardBackUrl,
      name,
      companyName,
      mobileNumber,
      whatsappNumber: whatsappNumber || mobileNumber,
      email,
      requirement,
      requirementDescription,
      otherRequirement,
      priority: priority || 'Normal',
      visitDate: visitDate || Date.now(),
      type: 'Customer'
    });

    // Save to database
    await customer.save();

    res.status(201).json({
      success: true,
      message: 'Customer details saved successfully',
      data: {
        id: customer._id,
        email: customer.email,
        mobileNumber: customer.mobileNumber,
        createdAt: customer.createdAt
      }
    });

  } catch (error) {
    console.error('Error saving customer:', error);
    res.status(500).json({ success: false, message: 'Failed to save customer details', error: error.message });
  }
});

// Get all customers (with pagination, filtering, and search)
app.get('/api/customers', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { priority, search } = req.query;
    console.log('GET /api/customers query:', req.query); // Debug log
    const query = {};

    // Filter by priority
    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    // Search functionality
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { name: searchRegex },
        { companyName: searchRegex },
        { mobileNumber: searchRegex },
        { email: searchRegex }
      ];
    }

    const customers = await Customer.find(query)
      .select('-cardFront -cardBack') // Exclude large image data for list view
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Customer.countDocuments(query);

    res.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
      error: error.message
    });
  }
});

// Get single customer by ID
app.get('/api/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });

  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer',
      error: error.message
    });
  }
});

// Update customer with dual image upload support (Cloudinary)
app.put('/api/customers/:id', upload.fields([{ name: 'cardFront', maxCount: 1 }, { name: 'cardBack', maxCount: 1 }]), async (req, res) => {
  try {
    const {
      name,
      companyName,
      mobileNumber,
      whatsappNumber,
      email,
      requirement,
      requirementDescription,
      otherRequirement,
      priority,
      visitDate
    } = req.body;

    let updateData = {
      name,
      companyName,
      mobileNumber,
      whatsappNumber,
      email,
      requirement,
      requirementDescription,
      otherRequirement,
      priority,
      visitDate,
      updatedAt: Date.now()
    };

    if (req.files) {
      if (req.files.cardFront) {
        console.log("DEBUG: Updating customer cardFront...");
        const result = await uploadFromBuffer(req.files.cardFront[0].buffer);
        updateData.cardFront = result.secure_url;
      }
      if (req.files.cardBack) {
        console.log("DEBUG: Updating customer cardBack...");
        const result = await uploadFromBuffer(req.files.cardBack[0].buffer);
        updateData.cardBack = result.secure_url;
      }
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, message: 'Customer updated successfully', data: customer });

  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ success: false, message: 'Failed to update customer', error: error.message });
  }
});

// Delete customer
app.delete('/api/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
      error: error.message
    });
  }
});

// Search customers
app.get('/api/customers/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const customers = await Customer.find({
      $or: [
        { email: { $regex: query, $options: 'i' } },
        { mobileNumber: { $regex: query, $options: 'i' } },
        { whatsappNumber: { $regex: query, $options: 'i' } }
      ]
    })
      .select('-cardFront -cardBack')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: customers
    });

  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search customers',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 MongoDB: ${MONGODB_URI}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});
