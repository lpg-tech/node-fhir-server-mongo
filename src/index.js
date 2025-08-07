const FHIRServer = require('@bluehalo/node-fhir-server-core');
const logger = require('@bluehalo/node-fhir-server-core').loggers.get();
const asyncHandler = require('./lib/async-handler');
const { connect: mongoClient } = require('./lib/mongo');
const globals = require('./globals');

const { fhirServerConfig, mongoConfig } = require('./config');

const { CLIENT, CLIENT_DB } = require('./constants');

let main = async function () {

  // Add a timeout to fail fast if the database is not available
  const connectionOptions = Object.assign({}, mongoConfig.options, {
    serverSelectionTimeoutMS: 5000, // Fail after 5 seconds if no server is available
  });

  // Connect to mongo and pass any options here

  let [mongoErr, client] = await asyncHandler(
    mongoClient(mongoConfig.connection, connectionOptions)
  );

  // If the client is created, we still need to verify the connection is alive
  if (!mongoErr && client) {
    // The driver connects lazily and may not throw an error until the first operation.
    // We can ping the admin database to ensure a connection is established.
    const [pingErr] = await asyncHandler(client.db('admin').command({ ping: 1 }));
    // If the ping fails, we will treat that as the connection error.
    if (pingErr) {
      mongoErr = pingErr;
    }
  }

  if (mongoErr) {
    console.error(mongoErr.message);
    console.error('❌ Could not connect to the database. 🔍 Is the service running?');
    console.error(mongoConfig.connection);
    process.exit(1);
  }

  // Save the client in another module so I can use it in my services
  globals.set(CLIENT, client);
  globals.set(CLIENT_DB, client.db(mongoConfig.db_name));

  // Start our FHIR server
  const server = FHIRServer.initialize(fhirServerConfig);

  logger.verbose('✅ Connected to MongoDB');
  server.listen(fhirServerConfig.server.port, () => logger.verbose('✅ Server is up and running!'));
};

main();
