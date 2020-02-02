<script>
  import { onMount, setContext } from 'svelte'
  import axios from 'axios'
  import Footer from '../components/Footer.svelte'
  import Header from '../components/Header.svelte'

  let user = null

  onMount(async () => {
    const token = localStorage.getItem('token')
    if (token) {
      const response = await axios(`http://localhost:3000/auth`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response) {
        localStorage.removeItem('token')
        user = null
      } else {
        localStorage.setItem('token', response.data.token)
        user = response.data
      }
    }
	});
</script>

<Header />
<main>
  <h1>Bazaar</h1>
</main>
<Footer />
