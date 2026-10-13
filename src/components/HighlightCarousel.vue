<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { EffectCoverflow, Navigation, Autoplay } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/navigation'

export interface HighlightItem {
  id: string
  gameId: string
  name: string
  customImage: string
  buttonColor: string
}

defineProps<{
  highlights: HighlightItem[]
}>()

const modules = [EffectCoverflow, Navigation, Autoplay]
</script>

<template>
  <div class="w-full py-4 relative highlight-carousel-wrapper animate-fade-in-scale">
    <swiper
      :modules="modules"
      effect="coverflow"
      :grab-cursor="true"
      :centered-slides="true"
      slides-per-view="auto"
      :initial-slide="0"
      :loop="true"
      :speed="800"
      :space-between="30"
      :navigation="{
        nextEl: '.custom-swiper-next',
        prevEl: '.custom-swiper-prev'
      }"
      :autoplay="{
        delay: 4500,
        disableOnInteraction: false
      }"
      :coverflow-effect="{
        rotate: 0,
        stretch: 0,
        depth: 150,
        modifier: 1.5,
        slideShadows: false
      }"
      class="w-full py-6"
    >
      <swiper-slide
        v-for="item in highlights"
        :key="item.id"
        class="highlight-slide relative rounded-2xl overflow-hidden bg-slate-900 select-none shadow-xl"
      >
        <!-- Blurred ambient background behind image -->
        <div
          class="absolute inset-0 bg-cover bg-center filter blur-xl brightness-50 scale-110"
          :style="{ backgroundImage: `url(${item.customImage})` }"
        ></div>

        <!-- Main Slide Image -->
        <router-link :to="`/product/${item.gameId}`" class="relative z-10 w-full h-full flex items-center justify-center">
          <img
            :src="item.customImage"
            :alt="item.name"
            class="w-full h-full object-cover sm:object-contain"
          />
        </router-link>

        <!-- "SHOP NOW" Button on Top-Right -->
        <router-link
          :to="`/product/${item.gameId}`"
          class="absolute top-5 right-5 z-20 font-extrabold text-xs sm:text-sm tracking-wider px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-white shadow-lg border border-white/20 hover:scale-105 active:scale-95 transition-all duration-300 drop-shadow"
          :style="{ backgroundColor: item.buttonColor }"
        >
          SHOP NOW
        </router-link>
      </swiper-slide>
    </swiper>

    <!-- Navigation Arrows -->
    <button
      class="custom-swiper-prev absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/50 hover:bg-primary text-white backdrop-blur-md flex items-center justify-center transition-all shadow-lg"
      aria-label="Previous Slide"
    >
      <i class="fa-solid fa-chevron-left text-base"></i>
    </button>
    <button
      class="custom-swiper-next absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/50 hover:bg-primary text-white backdrop-blur-md flex items-center justify-center transition-all shadow-lg"
      aria-label="Next Slide"
    >
      <i class="fa-solid fa-chevron-right text-base"></i>
    </button>
  </div>
</template>

<style scoped>
:deep(.swiper-slide) {
  width: 65% !important;
  max-width: 780px;
  height: 380px;
  opacity: 0.4;
  transition: opacity 0.5s ease;
}

:deep(.swiper-slide-active) {
  opacity: 1 !important;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
}

@media (max-width: 640px) {
  :deep(.swiper-slide) {
    width: 88% !important;
    height: 220px;
  }
}
</style>
