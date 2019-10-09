let key =''
  , secret = ''
;
const JSON = require('JSON')
;

(async function main() {
 const {GeminiAPI} = await import('gemini-api') // succeeds!

 console.log(GeminiAPI)

  const restClient = new GeminiAPI({ key, secret, sandbox: false })
  , { getTicker } = restClient
  ;

getTicker('btcusd')
  .then(data =>
    console.log(`Last trade: $${data.last} / BTC`)
  )

restClient.getAllSymbols()
  .then(data =>
    console.log(data)
  )
})();

