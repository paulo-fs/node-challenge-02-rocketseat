import { app } from './app'

app.listen({
   port: 3003,
})
   .then(() => {
      console.log('🔥 HTTP Server is running')
   })
