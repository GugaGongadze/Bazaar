<script>
  import axios from 'axios'
  import { getContext, setContext } from 'svelte'
  import router from 'page'

  let email = ''
  let password = ''

  async function handleLogin () { 
    const response = await axios.post('http://localhost:3000/login', { email, password })

    if (!response) {
      localStorage.removeItem('token')
    } else {
      localStorage.setItem('token', response.data.token)
      router.redirect('/')
    }
  }
</script>

<div class="w-full h-full flex justify-center items-center">
  <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
        Email
      </label>
      <input bind:value={email} class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="email" type="text" placeholder="Email">
    </div>
    <div class="mb-6">
      <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
        Password
      </label>
      <input bind:value={password} class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************">
    </div>
    <div class="flex items-center justify-between">
      <button on:click={handleLogin} class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" type="button">
        Sign In
      </button>
      <a class="cursor-pointer underline hover:text-blue-600 ml-4" href="/register">Need to sign up first?</a><span>&nbsp;👉🏻</span>
    </div>
  </form>
</div>
