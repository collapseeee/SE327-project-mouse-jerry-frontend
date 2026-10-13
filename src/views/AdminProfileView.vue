<script lang="ts">
export default {
  name: 'AdminProfileView'
}
</script>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async (): Promise<void> => {
  await authStore.logout()
  router.push('/login?mode=login')
}
</script>

<template>
  <main class="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
    <!-- Admin Profile Card matching reference design -->
    <div
      class="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl shadow-purple-950/10 border-t-[6px] border-[#360185] p-6 sm:p-8 flex flex-col items-center animate-card"
      data-test="admin-profile-card"
    >
      <!-- Circular Avatar with purple gradient and soft shadow -->
      <div
        class="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#1C0038] via-[#480072] to-[#7B0099] shadow-lg shadow-purple-900/30 flex items-center justify-center animate-avatar"
        data-test="admin-avatar"
      ></div>

      <!-- Admin Heading in heavy purple block font -->
      <h1
        class="text-2xl sm:text-3xl font-black text-[#2A0845] tracking-wider mt-4 uppercase animate-title"
        data-test="admin-title"
      >
        ADMIN
      </h1>

      <!-- Admin Pill Badge -->
      <div
        class="mt-1.5 px-4 py-0.5 bg-[#F4B342] text-slate-900 font-extrabold text-[11px] sm:text-xs rounded-full uppercase tracking-wider shadow-sm animate-badge"
        data-test="admin-badge"
      >
        ADMIN
      </div>

      <!-- Details Panel / Info Card -->
      <div
        class="w-full bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-4 sm:p-5 mt-6 flex flex-col gap-3 text-xs sm:text-sm animate-info"
        data-test="admin-info-panel"
      >
        <!-- Row 1: Account Name -->
        <div class="flex items-center justify-between animate-row-1" data-test="admin-row-account">
          <span class="text-slate-500 font-medium">Account Name</span>
          <span class="font-bold text-[#2A0845]" data-test="admin-account-name">
            {{ authStore.currentUsername || 'admin' }}
          </span>
        </div>

        <!-- Dashed separator -->
        <div class="border-b border-dashed border-slate-200 my-0.5"></div>

        <!-- Row 2: System Access -->
        <div class="flex items-center justify-between animate-row-2" data-test="admin-row-access">
          <span class="text-slate-500 font-medium">System Access</span>
          <span class="font-bold text-[#2A0845]" data-test="admin-system-access">
            Back-Office Full
          </span>
        </div>

        <!-- Row 3: Server Status -->
        <div class="flex items-center justify-between animate-row-3" data-test="admin-row-status">
          <span class="text-slate-500 font-medium">Server Status</span>
          <span class="font-bold text-emerald-500 flex items-center gap-1.5" data-test="admin-server-status">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Online
          </span>
        </div>
      </div>

      <!-- Logout Button -->
      <button
        type="button"
        class="w-full mt-6 py-2.5 sm:py-3 px-4 bg-[#DE1A58] hover:bg-[#c21349] active:bg-[#a50e3c] text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-rose-500/25 transition-all duration-200 hover:shadow-lg hover:scale-[1.01] active:scale-[0.98] cursor-pointer text-center animate-logout"
        data-test="admin-logout-btn"
        @click="handleLogout"
      >
        Logout
      </button>
    </div>
  </main>
</template>

<style scoped>
@keyframes cardEntrance {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes avatarPop {
  0% {
    opacity: 0;
    transform: scale(0.6);
  }
  70% {
    transform: scale(1.08);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeInDown {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.85);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(12px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-card {
  animation: cardEntrance 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.animate-avatar {
  animation: avatarPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.12s both;
}

.animate-title {
  animation: fadeInDown 0.4s ease-out 0.22s both;
}

.animate-badge {
  animation: fadeInScale 0.35s ease-out 0.32s both;
}

.animate-info {
  animation: fadeInUp 0.45s ease-out 0.42s both;
}

.animate-row-1 {
  animation: fadeInUp 0.4s ease-out 0.5s both;
}

.animate-row-2 {
  animation: fadeInUp 0.4s ease-out 0.56s both;
}

.animate-row-3 {
  animation: fadeInUp 0.4s ease-out 0.62s both;
}

.animate-logout {
  animation: fadeInUp 0.45s ease-out 0.7s both;
}
</style>
