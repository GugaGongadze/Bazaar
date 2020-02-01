<script>
  import router from 'page'
  import Home from './routes/Home.svelte'
  import Login from './routes/Login.svelte'
  import Register from './routes/Register.svelte'

  let page
  let params
  let user = null

  router('/login', () => page = Login)
  router('/register', () => page = Register)
  router('/', () => {
    if (!user) {
      router.redirect('/login')
    }

    page = Home
  })
  router('/*', () => router.redirect('/'))

  router.start()
</script>


<main>
  <svelte:component this={page} params={params} />
</main>

<style global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  main {
    height: 100%;
  }
</style>
