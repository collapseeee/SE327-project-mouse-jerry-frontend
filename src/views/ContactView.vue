<script lang="ts">
export default {
  name: 'ContactView'
}
</script>

<script setup lang="ts">
// Contact page view for Mouse Jerry
</script>

<template>
  <main class="max-w-5xl mx-auto px-6 py-10 min-h-[calc(100vh-8rem)]">
    <!-- Main Contact Card -->
    <div
      class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 sm:p-10"
      data-test="contact-card"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <!-- Left Column: Contact Channels & Address -->
        <div class="flex flex-col gap-8">
          <!-- Contact us section -->
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight mb-5">
              Contact us
            </h1>

            <ul class="flex flex-col gap-3.5 text-sm sm:text-base font-semibold text-slate-800">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-3 text-slate-800 hover:text-primary transition-colors cursor-pointer group"
                  data-test="contact-instagram"
                >
                  <i class="fa-brands fa-instagram text-xl text-primary transition-transform group-hover:scale-110"></i>
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-3 text-slate-800 hover:text-primary transition-colors cursor-pointer group"
                  data-test="contact-facebook"
                >
                  <i class="fa-brands fa-facebook-f text-xl text-primary w-5 text-center transition-transform group-hover:scale-110"></i>
                  <span>Facebook</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+66123456789"
                  class="flex items-center gap-3 text-slate-800 hover:text-primary transition-colors cursor-pointer group"
                  data-test="contact-phone"
                >
                  <i class="fa-solid fa-phone text-lg text-primary transition-transform group-hover:scale-110"></i>
                  <span>+66 123 456 789</span>
                </a>
              </li>
            </ul>
          </div>

          <!-- Address section -->
          <div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight mb-5">
              Address
            </h2>

            <div
              class="relative bg-slate-50/80 rounded-2xl p-5 pl-6 border border-slate-100/80 shadow-inner"
              data-test="contact-address-card"
            >
              <!-- Yellow accent left bar -->
              <div class="absolute left-0 top-3 bottom-3 w-1.5 bg-accent-yellow rounded-r-full"></div>

              <div class="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                <p class="font-bold text-slate-800 mb-1">
                  Mouse Jerry Keys HQ
                </p>
                <p>Floor 99, Cyber Gaming Tower</p>
                <p>Nimmanhaemin Road</p>
                <p>Chiang Mai, Thailand 50200</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Map -->
        <div class="flex flex-col">
          <h2 class="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight mb-5">
            Map
          </h2>

          <div
            class="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm relative bg-slate-100"
            data-test="contact-map-container"
          >
            <iframe
              title="Google Map Location - Male Dormitory 1, Chiang Mai"
              src="https://maps.google.com/maps?q=Male+Dormitory+1,+Suthep,+Mueang+Chiang+Mai+District,+Chiang+Mai+50200&t=&z=16&ie=UTF8&iwloc=&output=embed"
              class="w-full h-full border-0"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              allowfullscreen
              data-test="contact-map-iframe"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
