# Notion API - Crypto/Foreign Currency Prices

Based on the original repository from [Broto](https://github.com/brotoo25)/[Notion-API-Currencies](https://github.com/brotoo25/Notion-API-Currencies)

This repo is an update to the latest integration for Notion API totally made in JavaScript.

## Breaking Changes / Change log
* Removed the "updateCurrencyConversions" method cause it's not needed for me.
* Changed all the process to obtain the current cryptos from the Notion DB and then update them.
* Got available cryptos standalone to avoid repeated updates.
* Changed DB column name from "USD" to "Current" cause I want to obtain current value for each crypto instead of it's value on USD.

## Why I made this?
I want to get noticed for the all value changes on my crypto investments.  First i created my own Notion DB and then I started to search a method to update the current prices in my local currency (EUR)

I found this repo and I started to make changes to fit them to my DB and i ended with this solution.

This fork is for persons who follow an DCA investment strategy and don't want to waste time updating values from a table.

## Current DB

I leave here an image of my current DB

![screenshot image](/img/current-db-schema.png)

## DB Formulas

As you can see I setted a lot of formulas in my DB. I leave them below:

* "Status" (to see if you get gain or loss)
    * `(prop("Gain EUR") >= 0 or prop("Crypto") == "USDT") ? "🟢" : "🔴"`
* "Real Amount" (real amount obtained of the crypto at the moment of the investment)
    * `toNumber(slice(format(prop("Coin Amount") * prop("Coin Price")), 0, 5))`
* "% Gain" (Percentage of your gain/loss)
    * `toNumber(slice(format((prop("Current") / prop("Coin Price") - 1) * 100), 0, 4)) / 100`
* "Gain EUR" (Gain/loss in EUR)
    * `prop("% Gain") * prop("Real Amount") + prop("Real Amount") - prop("Invested")`

NOTE: I used EUR, but you can put your local currency in all the formulas and fields.

## Important fields
* **Crypto_ID**: ID of the crypto to query on CoinGecko API
* **Current**: Field used to update the current value of each crypto on your local currency

## Project Description:
[Medium Post](https://medium.com/@abraaorl/managing-financial-assets-with-notions-api-4945616d64f5)

## Setup:

### Notion Credentials
Create a `.env` file with the content of the `.env_dist` file with your own.

### Install 

```
yarn install
```

## Run:
```
yarn start
```