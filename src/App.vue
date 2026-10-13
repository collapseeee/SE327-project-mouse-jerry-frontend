<script setup lang="ts">
import Navbar from './components/Navbar.vue'
import ToastContainer from './components/common/ToastContainer.vue'
</script>

<template>
  <Navbar />
  <RouterView />
  <ToastContainer />
</template>
