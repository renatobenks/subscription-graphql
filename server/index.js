// external imports
import express from 'express'
import bodyParser from 'body-parser'
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express'
import { createServer } from 'http'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { execute, subscribe } from 'graphql'
// local imports
import schema from './modules/api/schema'

// our application
const app = express()
const port = process.env.SERVER_PORT

app.get('/', (req, res) => res.send('Hello world! You are at the server port'))

app.use('/graphql', bodyParser.json(), graphqlExpress(req =>
  ({ schema, context: req })))
app.use('/graphiql', graphiqlExpress(req => {
  return {
    endpointURL: '/graphql',
    subscriptionsEndpoint: `ws://localhost:${port}/subscriptions`,
    websocketConnectionParams: { cookies: req.cookies, headers: req.headers },
  }
}))

const server = createServer(app)
server.listen(port, () => {
  console.log(`server now listening at :${port}`)
  new SubscriptionServer(
    {
      onConnect: connectionParams => {
        console.log('client subscription connected!')
        return connectionParams
      },
      onDisconnect: () => console.log('client subscription disconnected!'),
      execute,
      subscribe,
      schema
    },
    { server, path: '/subscriptions' }
  )
})
