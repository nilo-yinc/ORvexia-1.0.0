// const appsRegistry = require('../apps/registry');

// exports.listApps = (req, res) => {
//   const apps = Object.values(appsRegistry).map(app => ({
//     name: app.name,
//     key: app.key,
//     iconUrl: app.iconUrl,
//     primaryColor: app.primaryColor,
//   }));
//   res.json({ data: apps });
// };

// exports.getApp = (req, res) => {
//   const { appKey } = req.params;
//   const app = appsRegistry[appKey];
//   console.log(appKey, app);
//   if (!app) {
//     return res.status(404).json({ error: 'App not found' });
//   }
//   res.json({ data: app });
// };
