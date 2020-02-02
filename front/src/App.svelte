<script>
  import router from 'page'
  import Home from './routes/Home.svelte'
  import Login from './routes/Login.svelte'
  import Register from './routes/Register.svelte'

  let component
  let props

  router('/login', () => {
    const token = localStorage.getItem('token')

    if (token) {
      router.redirect('/')
    }

    component = Login
  })
  router('/register', () => {
    const token = localStorage.getItem('token')

    if (token) {
      router.redirect('/')
    }

    component = Register
  })
  router('/', () => {
    const token = localStorage.getItem('token')

    if (!token) {
      router.redirect('/login')
    }

    component = Home
  })
  router('/*', () => router.redirect('/'))

  router.start()
</script>


<main>
  <svelte:component this={component} props={props} />
</main>

<style global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  main {
    height: 100%;
  }
</style>
