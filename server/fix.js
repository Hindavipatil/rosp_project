const mongoose = require('mongoose');
mongoose.connect('mongodb://0.0.0.0:27017/galleryAchievementsDB').then(async () => {
  const Initiative = mongoose.model('Initiative', new mongoose.Schema({}, {strict:false}));
  await Initiative.updateMany({ category: 'Empowerment' }, { $set: { category: 'Women Empowerment' } });
  process.exit(0);
});
