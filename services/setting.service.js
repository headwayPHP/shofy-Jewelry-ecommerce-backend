const Setting = require('../model/Setting');

exports.createSetting = async (data) => await Setting.create(data);


exports.getAllSettings = async () => await Setting.find();

exports.getSettingsByNames = async (namesArray) => {
    // Fetch settings by names that match the array and have status true
    return await Setting.find({
        name: { $in: namesArray },
        status: true
    }).select('name value group desc'); // Select only fields needed
};

exports.updateSettingsByIds = async (updates) => {
    const bulkOps = updates.map(({ id, value }) => ({
        updateOne: {
            filter: { _id: id },
            update: { value, updatedAt: new Date() }
        }
    }));
    return await Setting.bulkWrite(bulkOps);
};

exports.deleteSetting = async (id) => await Setting.findByIdAndDelete(id);

exports.getSettingByKey = async (key) => {
    const setting = await Setting.findOne({ name: key });
    return setting?.value || null;
};
