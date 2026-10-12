const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Complaint = require('./models/Complaint');
const ComplaintHistory = require('./models/ComplaintHistory');
const Department = require('./models/Department');
const Category = require('./models/Category');
const Notification = require('./models/Notification');

async function checkDatabase() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_complaint_db';
    console.log(`\n======================================================`);
    console.log(` Connecting to: ${uri}`);
    console.log(`======================================================\n`);

    await mongoose.connect(uri);

    const [usersCount, complaintsCount, historyCount, deptsCount, catsCount, notifsCount] = await Promise.all([
      User.countDocuments(),
      Complaint.countDocuments(),
      ComplaintHistory.countDocuments(),
      Department.countDocuments(),
      Category.countDocuments(),
      Notification.countDocuments()
    ]);

    console.log(`📊 DATABASE COLLECTION SUMMARY:`);
    console.log(`------------------------------------------------------`);
    console.log(`  📁 Users:             ${usersCount} documents`);
    console.log(`  📁 Complaints:        ${complaintsCount} documents`);
    console.log(`  📁 ComplaintHistory:  ${historyCount} audit records`);
    console.log(`  📁 Departments:       ${deptsCount} departments`);
    console.log(`  📁 Categories:        ${catsCount} categories`);
    console.log(`  📁 Notifications:     ${notifsCount} notifications`);
    console.log(`------------------------------------------------------\n`);

    console.log(`🔍 SAMPLE COMPLAINTS IN DATABASE:`);
    const complaints = await Complaint.find().limit(3).select('complaintId title status priority category');
    complaints.forEach((c, idx) => {
      console.log(`  ${idx + 1}. [${c.complaintId}] - "${c.title}"`);
      console.log(`     Status: ${c.status} | Priority: ${c.priority} | Category: ${c.category}`);
    });

    console.log(`\n🔍 REGISTERED DEMO USERS:`);
    const users = await User.find().select('name email role');
    users.forEach((u) => {
      console.log(`  • ${u.name} (${u.email}) [Role: ${u.role}]`);
    });

    console.log(`\n======================================================`);
    console.log(` ✅ Database is ACTIVE, HEALTHY and accessible!`);
    console.log(`======================================================\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  }
}

checkDatabase();
