require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('../src/models/project');
const Participation = require('../src/models/participation.model');

const isDryRun = process.argv.includes('--dry-run');

const run = async () => {
  const stats = {
    projects: 0,
    changed: 0,
    unchanged: 0,
  };

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    const projects = await Project.find({}).select('_id title volunteersCount').lean();
    stats.projects = projects.length;

    for (const project of projects) {
      const activeCount = await Participation.countDocuments({
        projectId: project._id,
        status: { $in: ['approved', 'completed'] },
      });

      const currentCount = project.volunteersCount || 0;
      if (currentCount === activeCount) {
        stats.unchanged += 1;
        continue;
      }

      if (isDryRun) {
        console.log(`[dry-run] ${project._id} ${project.title || ''}: ${currentCount} -> ${activeCount}`);
      } else {
        await Project.updateOne({ _id: project._id }, { $set: { volunteersCount: activeCount } });
        console.log(`[updated] ${project._id} ${project.title || ''}: ${currentCount} -> ${activeCount}`);
      }

      stats.changed += 1;
    }

    console.log('--- Sync Summary ---');
    console.log(`Projects scanned: ${stats.projects}`);
    console.log(`Changed: ${stats.changed}`);
    console.log(`Unchanged: ${stats.unchanged}`);
    console.log(`Mode: ${isDryRun ? 'dry-run' : 'write'}`);
  } catch (error) {
    console.error(`Sync error: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
