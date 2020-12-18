module.exports = {
	secretKey: process.env.SECRET || '12345-67890-09876-54321',
	mongoUrl:
		'mongodb+srv://armoredvortex:chandrasar@cluster0.6ntom.gcp.mongodb.net/Locbo?retryWrites=true&w=majority',
	// "mongodb://localhost:27017/locbo",
	facebook: {
		clientID: process.env.CLIENT_ID,
		clientSecret: process.env.CLIENT_SECRET,
	},
};
