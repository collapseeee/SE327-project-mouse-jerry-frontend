<script setup lang="ts">
import { ref } from 'vue'
import logoImg from '@/assets/logo.png'

const searchQuery = ref('')
</script>

<template>
  <nav class="w-full bg-primary text-white shadow-md">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
      <!-- Left side: Brand Logo & Links -->
      <div class="flex items-center gap-6">
        <router-link to="/" class="flex items-center gap-2.5 group">
          <img
            :src="logoImg"
            alt="Mouse Jerry"
            class="w-10 h-10 rounded-full border border-white/20 object-cover group-hover:scale-105 transition-transform"
          />
          <span class="font-bold text-xl tracking-tight text-white group-hover:text-accent-yellow transition-colors">
            Mouse Jerry
          </span>
        </router-link>

        <div class="hidden md:flex items-center gap-5 text-sm font-medium">
          <button class="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors">
            <i class="fa-solid fa-gamepad text-accent-yellow"></i>
            <span>Category</span>
            <i class="fa-solid fa-chevron-down text-xs text-white/70"></i>
          </button>

          <router-link to="/contact" class="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors">
            <i class="fa-solid fa-envelope text-accent-yellow"></i>
            <span>Contact</span>
          </router-link>
        </div>
      </div>

      <!-- Right side: Search bar & User Actions -->
      <div class="flex items-center gap-5">
        <div class="relative w-56 sm:w-72">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search epic games..."
            class="w-full pl-4 pr-10 py-1.5 bg-white text-slate-800 placeholder-slate-400 text-sm rounded-full border-none focus:outline-none focus:ring-2 focus:ring-accent-yellow shadow-inner"
          />
          <i class="fa-solid fa-magnifying-glass absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
        </div>

        <router-link to="/cart" class="relative text-white hover:text-accent-yellow transition-colors p-1" title="Shopping Cart">
          <i class="fa-solid fa-cart-shopping text-lg"></i>
        </router-link>

        <router-link to="/login" class="text-white hover:text-accent-yellow transition-colors p-1" title="User Profile">
          <i class="fa-solid fa-user text-lg"></i>
        </router-link>
      </div>
    </div>
  </nav>
</template>