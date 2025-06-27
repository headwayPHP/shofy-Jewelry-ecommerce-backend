const settingService = require('../services/setting.service');

exports.createSetting = async (req, res) => {
    try {
        const { name, type = 'text', status = true, group, desc } = req.body;

        if (!name) {
            return res.status(400).json({ status: false, message: 'Name is required' });
        }

        let value = req.body.value;

        // Handle image if uploaded
        if (req.file) {
            value = req.file.filename;
        }

        const setting = await settingService.createSetting({
            name, value, type, status, group, desc
        });

        res.status(201).json({ status: true, message: 'Setting created', data: setting });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
};


const baseUrl = process.env.ADMIN_URL || 'http://localhost:3000';

exports.getAllSettings = async (req, res) => {
    try {
        const settings = await settingService.getAllSettings();

        const formatted = settings.map(setting => {
            const isImage = setting.type === 'image';
            return {
                ...setting.toObject(), value: isImage ? `${baseUrl}images/${setting.value}` : setting.value
            };
        });

        res.status(200).json({ status: true, data: formatted });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
};


// exports.updateSettingsByIds = async (req, res) => {
//     try {
//         const updates = req.body;
//
//         if (!updates || !Array.isArray(updates)) {
//             return res.status(400).json({status: false, message: 'Updates should be a JSON array'});
//         }
//
//         // Known IDs for logo and bank_logo settings - replace with your real IDs
//         const logoSettingId = '682b23e411bab4b9970da990';
//         const bankLogoSettingId = '682b247498694797ec865d41';
//
//         if (req.files) {
//             if (req.files.logo && req.files.logo.length > 0) {
//                 const logoUpdate = updates.find(u => u.id === logoSettingId);
//                 if (logoUpdate) {
//                     logoUpdate.value = req.files.logo[0].filename;
//                 }
//             }
//
//             if (req.files.bank_logo && req.files.bank_logo.length > 0) {
//                 const bankLogoUpdate = updates.find(u => u.id === bankLogoSettingId);
//                 if (bankLogoUpdate) {
//                     bankLogoUpdate.value = req.files.bank_logo[0].filename;
//                 }
//             }
//         }
//
//         await settingService.updateSettingsByIds(updates);
//
//         res.status(200).json({status: true, message: 'Settings updated successfully'});
//     } catch (err) {
//         res.status(500).json({status: false, message: err.message});
//     }
// };

exports.updateSettingsByNames = async (req, res) => {
    try {
        // req.body contains all string fields: { address: 'new address', email: 'root@root.com', ... }
        // req.files contains uploaded files: { logo: [...], bank_logo: [...] }

        // Fetch all existing settings from DB, to map name -> id
        const settings = await settingService.getAllSettings(); // your method to fetch all

        // Build a map for quick lookup by name
        const nameToSetting = {};
        settings.forEach(setting => {
            nameToSetting[setting.name] = setting;
        });

        const updates = [];

        // Update string values from req.body
        for (const [key, value] of Object.entries(req.body)) {
            if (nameToSetting[key]) {
                updates.push({
                    id: nameToSetting[key]._id || nameToSetting[key].id,  // depending on your DB
                    value: value,
                });
            }
        }

        // Update files from req.files
        if (req.files) {
            for (const [key, files] of Object.entries(req.files)) {
                if (files.length > 0 && nameToSetting[key]) {
                    // You can generate the URL or use the filename as you prefer
                    const fileUrl = `${files[0].filename}`;
                    updates.push({
                        id: nameToSetting[key]._id || nameToSetting[key].id,
                        value: fileUrl,
                    });
                }
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({ status: false, message: "No valid settings to update" });
        }

        // Call your update service with array of {id, value}
        await settingService.updateSettingsByIds(updates);

        return res.status(200).json({ status: true, message: "Settings updated successfully" });

    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
};



exports.deleteSetting = async (req, res) => {
    try {
        await settingService.deleteSetting(req.params.id);
        res.status(200).json({ status: true, message: 'Setting deleted successfully' });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
};
