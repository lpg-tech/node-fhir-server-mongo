const { VERSIONS } = require('@bluehalo/node-fhir-server-core').constants;

/**
 * @name mongoConfig
 * @summary Configurations for our Mongo instance
 */
const mongoConfig = {
  connection: `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOSTNAME}:${process.env.MONGO_PORT}/${process.env.MONGO_DB_NAME}?authSource=${process.env.MONGO_AUTHSOURCE}`,
  db_name: process.env.MONGO_DB_NAME,
  options: {},
};

// Set up whitelist
const whitelist_env =
  (process.env.WHITELIST && process.env.WHITELIST.split(',').map((host) => host.trim())) || false;

// If no whitelist is present, disable cors
// If it's length is 1, set it to a string, so * works
// If there are multiple, keep them as an array
const whitelist = whitelist_env && whitelist_env.length === 1 ? whitelist_env[0] : whitelist_env;

const PROFILE_VERSIONS = [VERSIONS['4_0_0']];

/**
 * @name fhirServerConfig
 * @summary @bluehalo/node-fhir-server-core configurations.
 */
const fhirServerConfig = {
  auth: {
    // This servers URI
    resourceServer: process.env.RESOURCE_SERVER,
    //
    // if you use this strategy, you need to add the corresponding env vars to docker-compose
    //
    // strategy: {
    // 	name: 'bearer',
    // 	useSession: false,
    // 	service: './src/strategies/bearer.strategy.js'
    // },
  },
  server: {
    // support various ENV that uses PORT vs SERVER_PORT
    port: process.env.PORT || process.env.SERVER_PORT,
    // allow Access-Control-Allow-Origin
    corsOptions: {
      maxAge: 86400,
      origin: whitelist,
    },
  },
  logging: {
    level: process.env.LOGGING_LEVEL,
  },
  //
  // If you want to set up conformance statement with security enabled
  // Uncomment the following block
  //
  security: [
    {
      url: 'authorize',
      valueUri: `${process.env.AUTH_SERVER_URI}/authorize`,
    },
    {
      url: 'token',
      valueUri: `${process.env.AUTH_SERVER_URI}/token`,
    },
    // optional - registration
  ],
  //
  // Add any profiles you want to support.  Each profile can support multiple versions
  // if supported by core.  To support multiple versions, just add the versions to the array.
  //
  // Example:
  // Account: {
  //		service: './src/services/account/account.service.js',
  //		versions: [ VERSIONS['4_0_0'], VERSIONS['3_0_1'], VERSIONS['1_0_2'] ]
  // },
  //
  profiles: {
    Account: {
      service: './src/services/account/account.service.js',
      versions: PROFILE_VERSIONS,
    },
    AllergyIntolerance: {
      service: './src/services/allergyintolerance/allergyintolerance.service.js',
      versions: PROFILE_VERSIONS,
    },
    Claim: {
      service: './src/services/claim/claim.service.js',
      versions: PROFILE_VERSIONS,
    },
    Organization: {
      service: './src/services/organization/organization.service.js',
      versions: PROFILE_VERSIONS,
    },
    Condition: {
      service: './src/services/condition/condition.service.js',
      versions: PROFILE_VERSIONS,
    },
    Patient: {
      service: './src/services/patient/patient.service.js',
      versions: PROFILE_VERSIONS,
    },
  },
};

module.exports = {
  fhirServerConfig,
  mongoConfig,
};
