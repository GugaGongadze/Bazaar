<script>
  import router from 'page'
  let src = 'logo.png'

  function handleLogout() {
    localStorage.removeItem('token')
    router.redirect('/login')
  }
</script>

<header class="flex justify-between items-center">
  <img class="logo" {src} alt="Logo" >

  <nav class="m-10">
    <button on:click={handleLogout} class="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded">
      Logout
    </button>
  </nav>
</header>

<style>
  .logo {
    width: 80px;
  }
</style>
