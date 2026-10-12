const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Department = require('./models/Department');
const Category = require('./models/Category');
const Complaint = require('./models/Complaint');
const ComplaintHistory = require('./models/ComplaintHistory');
const Notification = require('./models/Notification');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_complaint_db';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing database collections...');
    await Promise.all([
      User.deleteMany(),
      Department.deleteMany(),
      Category.deleteMany(),
      Complaint.deleteMany(),
      ComplaintHistory.deleteMany(),
      Notification.deleteMany()
    ]);

    console.log('Seeding Departments...');
    const departments = await Department.insertMany([
      { name: 'Estate & Maintenance', description: 'Handles plumbing, repairs, and campus facilities', head: 'Prof. R. Sharma' },
      { name: 'Electrical Engineering & Maintenance', description: 'Power supply, lighting, and electrical equipment', head: 'Er. Suresh Patel' },
      { name: 'IT Infrastructure & Networking', description: 'Campus Wi-Fi, lab systems, and internet connectivity', head: 'Dr. Anita Desai' },
      { name: 'Hostel Administration', description: 'Hostel rooms, hygiene, mess, and water issues', head: 'Mr. Vikram Singh' },
      { name: 'Sanitation & Cleanliness', description: 'Campus hygiene, waste management, and washroom upkeep', head: 'Mrs. Sunita Rao' },
      { name: 'Campus Security', description: 'Gate access, CCTV, parking, and night vigilance', head: 'Capt. K. Verma' },
      { name: 'Library & Learning Resources', description: 'Library seating, book inventory, digital library', head: 'Dr. Meenakshi Iyer' }
    ]);

    console.log('Seeding Categories...');
    const categoryList = [
      'Hostel',
      'Classroom',
      'Laboratory',
      'Library',
      'Canteen',
      'Transport',
      'Internet/Wi-Fi',
      'Electricity',
      'Water Supply',
      'Cleanliness',
      'Security',
      'Infrastructure',
      'Academic',
      'Other'
    ];

    await Category.insertMany(
      categoryList.map((cat) => ({
        name: cat,
        description: `Issues and complaints related to ${cat}`
      }))
    );

    console.log('Seeding Demo Users...');
    // Create demo users
    const adminUser = await User.create({
      name: 'Campus Administrator',
      email: 'admin@campus.com',
      password: 'Admin@123',
      employeeId: 'ADM-1001',
      phone: '+91 9876543210',
      role: 'admin',
      department: departments[0]._id,
      isActive: true
    });

    const staffUser = await User.create({
      name: 'Er. Rajesh Kumar',
      email: 'staff@campus.com',
      password: 'Staff@123',
      employeeId: 'STF-2045',
      phone: '+91 9876543211',
      role: 'staff',
      department: departments[2]._id, // IT Infrastructure
      isActive: true
    });

    const staffUser2 = await User.create({
      name: 'Mrs. Sunita Rao',
      email: 'sanitation@campus.com',
      password: 'Staff@123',
      employeeId: 'STF-3012',
      phone: '+91 9876543214',
      role: 'staff',
      department: departments[4]._id, // Sanitation
      isActive: true
    });

    const studentUser = await User.create({
      name: 'Aarav Sharma',
      email: 'student@campus.com',
      password: 'Student@123',
      studentId: 'STU-2023-CS-042',
      phone: '+91 9876543212',
      role: 'student',
      department: departments[2]._id,
      isActive: true
    });

    const studentUser2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@campus.com',
      password: 'Student@123',
      studentId: 'STU-2024-EC-018',
      phone: '+91 9876543213',
      role: 'student',
      department: departments[1]._id,
      isActive: true
    });

    console.log('Seeding Sample Complaints...');
    // Sample complaint 1: In Progress
    const complaint1 = await Complaint.create({
      complaintId: 'CMP-2026-0001',
      title: 'Wi-Fi Connection Dropping in Library 2nd Floor',
      description: 'The Wi-Fi router on the 2nd floor digital reading section loses signal every 10 minutes, making online research impossible during study hours.',
      category: 'Internet/Wi-Fi',
      location: 'Central Library, 2nd Floor Digital Wing',
      priority: 'High',
      status: 'In Progress',
      createdBy: studentUser._id,
      assignedTo: staffUser._id,
      department: departments[2]._id,
      comments: [
        {
          user: staffUser._id,
          comment: 'Inspected the access point router. Firmware update is scheduled today afternoon.',
          createdAt: new Date(Date.now() - 3600000 * 5)
        },
        {
          user: studentUser._id,
          comment: 'Thank you for looking into this promptly!',
          createdAt: new Date(Date.now() - 3600000 * 2)
        }
      ]
    });

    await ComplaintHistory.create([
      {
        complaint: complaint1._id,
        previousStatus: 'None',
        newStatus: 'Submitted',
        changedBy: studentUser._id,
        comment: 'Complaint submitted by student',
        changedAt: new Date(Date.now() - 3600000 * 24)
      },
      {
        complaint: complaint1._id,
        previousStatus: 'Submitted',
        newStatus: 'Under Review',
        changedBy: adminUser._id,
        comment: 'Complaint reviewed by Admin and flagged for IT team',
        changedAt: new Date(Date.now() - 3600000 * 18)
      },
      {
        complaint: complaint1._id,
        previousStatus: 'Under Review',
        newStatus: 'Assigned',
        changedBy: adminUser._id,
        comment: 'Assigned to Er. Rajesh Kumar (IT)',
        changedAt: new Date(Date.now() - 3600000 * 12)
      },
      {
        complaint: complaint1._id,
        previousStatus: 'Assigned',
        newStatus: 'In Progress',
        changedBy: staffUser._id,
        comment: 'Diagnostic in progress on network switch',
        changedAt: new Date(Date.now() - 3600000 * 6)
      }
    ]);

    // Sample complaint 2: Resolved
    const complaint2 = await Complaint.create({
      complaintId: 'CMP-2026-0002',
      title: 'Water Cooler Leaking in Block B 1st Floor',
      description: 'The RO drinking water cooler near Room B-104 is overflowing and water is pooling on the floor, posing a slipping hazard.',
      category: 'Water Supply',
      location: 'Academic Block B, Corridor near Room 104',
      priority: 'Critical',
      status: 'Resolved',
      createdBy: studentUser._id,
      assignedTo: adminUser._id,
      department: departments[0]._id,
      resolvedAt: new Date(Date.now() - 3600000 * 8),
      comments: [
        {
          user: adminUser._id,
          comment: 'Plumbing technician replaced the broken intake valve. Verified leak has stopped.',
          createdAt: new Date(Date.now() - 3600000 * 8)
        }
      ]
    });

    await ComplaintHistory.create([
      {
        complaint: complaint2._id,
        previousStatus: 'None',
        newStatus: 'Submitted',
        changedBy: studentUser._id,
        comment: 'Complaint submitted by student',
        changedAt: new Date(Date.now() - 3600000 * 48)
      },
      {
        complaint: complaint2._id,
        previousStatus: 'Submitted',
        newStatus: 'Resolved',
        changedBy: adminUser._id,
        comment: 'Valve replaced and verified dry',
        changedAt: new Date(Date.now() - 3600000 * 8)
      }
    ]);

    // Sample complaint 3: Submitted (Pending)
    const complaint3 = await Complaint.create({
      complaintId: 'CMP-2026-0003',
      title: 'Broken Desk & Projector Screen in Lab 3',
      description: 'System desk #14 has loose wooden arm and the ceiling projector screen does not pull down properly for presentations.',
      category: 'Laboratory',
      location: 'Computer Science Lab 3, 3rd Floor',
      priority: 'Medium',
      status: 'Submitted',
      createdBy: studentUser2._id,
      department: departments[0]._id
    });

    await ComplaintHistory.create([
      {
        complaint: complaint3._id,
        previousStatus: 'None',
        newStatus: 'Submitted',
        changedBy: studentUser2._id,
        comment: 'Complaint submitted by student',
        changedAt: new Date(Date.now() - 3600000 * 2)
      }
    ]);

    // Sample notifications
    await Notification.create([
      {
        recipient: studentUser._id,
        sender: staffUser._id,
        complaint: complaint1._id,
        title: 'Status Updated: In Progress',
        message: 'Your complaint #CMP-2026-0001 is now In Progress with IT Infrastructure.',
        type: 'status_change',
        isRead: false
      },
      {
        recipient: studentUser._id,
        sender: adminUser._id,
        complaint: complaint2._id,
        title: 'Complaint Resolved',
        message: 'Your complaint #CMP-2026-0002 has been marked as Resolved.',
        type: 'status_change',
        isRead: true
      }
    ]);

    console.log('----------------------------------------------------');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('----------------------------------------------------');
    console.log('DEMO ACCOUNTS:');
    console.log('1. Admin:   admin@campus.com   / Admin@123');
    console.log('2. Staff:   staff@campus.com   / Staff@123');
    console.log('3. Student: student@campus.com / Student@123');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
