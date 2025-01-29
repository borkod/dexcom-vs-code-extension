export interface GlucoseItem
{
    DT: string;
    ST: string;
    Trend: number;
    Value: number;
    WT: string;
}

export interface GlucoseMeasurement extends GlucoseItem
{
    ValueInMgPerDl: number;
    isHigh: boolean;
    isLow: boolean;
}

import axios from 'axios';
var meta = require('../package.json');
var qs = require('querystring');

interface Opts
{
    accountId: string;
    accountName: string;
    password: string;
    sessionID: string;
}

// Defaults
var server = "share2.dexcom.com";

var Defaults = {
    "applicationId":"d89443d2-327c-4a6f-89e5-496bbb0317db"
  , "agent": [meta.name, meta.version].join('/')
  , auth:  'https://' + server + '/ShareWebServices/Services/General/AuthenticatePublisherAccount'
  , login: 'https://' + server + '/ShareWebServices/Services/General/LoginPublisherAccountById'
  , accept: 'application/json'
  , 'content-type': 'application/json'
  , LatestGlucose: 'https://' + server + '/ShareWebServices/Services/Publisher/ReadPublisherLatestGlucoseValues'
  // ?sessionID=e59c836f-5aeb-4b95-afa2-39cf2769fede&minutes=1440&maxCount=1"
  };

// Asynchronously fetch data from Dexcom's server.
// Will fetch `minutes` and `maxCount` records.
async function fetch (opts: Opts): Promise<GlucoseMeasurement> {
    var url = fetch_query(opts);
    var body = "";
    var headers = { 'User-Agent': Defaults.agent
                  , 'Content-Type': Defaults['content-type']
                  , 'Content-Length': 0
                  , 'Accept': Defaults.accept };
  
    try {
        const response = await axios.post(url, body, { headers, validateStatus: () => true });
        return response;
    } catch (err) {
        console.log("Cannot authorize account: ", err);
        throw err;
    }
  }

  // Assemble query string for fetching data.
function fetch_query (opts: Opts) {
    // ?sessionID=e59c836f-5aeb-4b95-afa2-39cf2769fede&minutes=1440&maxCount=1"
    var q = {
      sessionID: opts.sessionID
    , minutes: 1440
    , maxCount: 1
    };
    var url = Defaults.LatestGlucose + '?' + qs.stringify(q);
    return url;
  }

function refresh_token (opts: Opts) {
    console.log('Fetching new token');
    opts.accountId = "";
    authorize(opts)
        .then((res) => {
        if ( res && res.statusCode === 200) {
            opts.sessionID = res.data;
        } else {
        var responseStatus = res ? res.statusCode : "response not found";
        var responseBody = res ? res.data : "response not found";
        console.log("Error refreshing token", responseStatus, responseBody);
        }
    })
    .catch((error) => {
        console.log("Error refreshing token", error);
    });
}

  // Login to Dexcom's server.
async function authorize (opts: Opts): Promise<any | null> {
    getAccountId(opts)
    .then(async (res) => {
      if ( res && res.statusCode === 200 ) {
        opts.accountId = res.data;
        console.log("accountId: " + opts.accountId);
  
        var url = Defaults.login;
        var body = login_payload(opts);
        var headers = { 'User-Agent': Defaults.agent
                      , 'Content-Type': Defaults['content-type']
                      , 'Accept': Defaults.accept };
        
        try {
            const response = await axios.post(url, body, { headers, validateStatus: () => true });
            return response;
        } catch (err) {
            console.log("Cannot authorize account: ", err);
            throw err;
        }
        } else {
            var responseStatus = res ? res.statusCode : "response not found";
            var responseBody = res ? res.data : "response not found";
            console.log("Cannot authorize account: ", responseStatus, responseBody);
        }
    })
    .catch((error) => {
        console.log("Cannot get account id: ", error);
        throw error;
      });
}

async function getAccountId(opts: Opts): Promise<any | null> {
  
    var url = Defaults.auth;
    var body = auth_payload(opts);
    var headers = { 'User-Agent': Defaults.agent
                , 'Content-Type': Defaults['content-type']
                , 'Accept': Defaults.accept };

    try {
        const response = await axios.post(url, body, { headers, validateStatus: () => true });
        return response;
    } catch (err) {
        console.log("Cannot get account id: ", err);
        throw err;
    }
}

function auth_payload (opts: Opts) {
  var body = {
    "password": opts.password
    , "applicationId" : Defaults.applicationId
    , "accountName": opts.accountName
    };
    return body;
}

// assemble the POST body for the login endpoint
function login_payload (opts: Opts) {
    var body = {
      "password": opts.password
    , "applicationId" : Defaults.applicationId
    , "accountId": opts.accountId
    };
    return body;
}