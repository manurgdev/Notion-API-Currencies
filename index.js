const axios = require( 'axios' )
const cron = require( 'node-cron' )
const dotenv = require( 'dotenv' ).config()
const https = require( 'https' );
const { Client } = require( '@notionhq/client' )

const axiosClient = axios.create( {
  timeout: 160000,
  maxContentLength: 500 * 1000 * 1000,
  httpsAgent: new https.Agent( { keepAlive: true } ),
} )

const notion = new Client( {
  auth: process.env.NOTION_TOKEN,
} )

const databaseId = process.env.NOTION_DATABASE_ID
const defaultCurrency = process.env.DEFAULT_CURRENCY

const refreshDatabase = async () => {
  const payload = {
    database_id: process.env.NOTION_DATABASE_ID
  }

  const { results } = await notion.databases.query( payload );
  let cryptos = results.map( result => {
    return { page_id: result.id, name: result.properties.Crypto_ID.select.name };
  } )

  if ( cryptos ) {
    updateCryptoConversions( cryptos );
  }
}

async function updateCryptoConversions( cryptos ) {
  let uniqueCryptos = [...new Set( cryptos.map( crypto => crypto.name ) )];
  uniqueCryptos.forEach( async ( uniqueCrypto ) => {
    const coinType = uniqueCrypto || "EMPTY"
    if ( coinType != "EMPTY" ) {
      const cryptoValue = await fetchPriceOnCoinGecko( coinType, defaultCurrency )
      _updateNotionTable( cryptos.filter( crypto => crypto.name === coinType ), cryptoValue )
    }
  } )
}

async function _updateNotionTable( pagesToUpdate, cryptoValue ) {
  pagesToUpdate.forEach( ( { page_id } ) => {
    notion.pages.update( {
      page_id,
      properties: {
        Current: {
          number: cryptoValue
        }
      }
    } )
  } )
}

/**
 * Get most recent price of any crypto listed at CoinGecko.
 * Params: (coin) - Crypto ID from CoinGecko, all crypto IDs can be found at:
 *                  https://api.coingecko.com/api/v3/coins/list?include_platform=false
 *         (defaultCurrency) - Base Currency Code to calculate price. Ex: USD, BRL, NZD
 **/
async function fetchPriceOnCoinGecko( coin, defaultCurrency ) {
  try {
    const response = await axiosClient.get( `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=${defaultCurrency}` );
    return response.data[`${coin}`][defaultCurrency.toLowerCase()]
  } catch ( error ) {
    console.error( error );
  }
}

// Run the refresh every minute | Change it as you want or remove cron for one-shot refresh
cron.schedule( '* * * * *', () => {
  refreshDatabase()
} )