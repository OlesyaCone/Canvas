<script setup lang="ts">
import { onMounted } from "vue";
import { useProfileStore } from "../../stores/profile";
import { useAuthStore } from "../../stores/auth";

const profileStore = useProfileStore();
const authStore = useAuthStore();

onMounted(() => { profileStore.fetchProfileStats(); });
</script>

<template>
    <div class="profile-page" v-if="profileStore.stats">
        <h2 class="page-title">Мой профиль</h2>
        <div class="profile-card card">
            <div class="profile-avatar">
                <img :src="authStore.userAvatar" alt="avatar" />
            </div>
            <div class="profile-info">
                <h2>{{ profileStore.stats.user.username }}</h2>
                <p>{{ profileStore.stats.user.email }}</p>
                <p>Дата регистрации: {{ new Date(profileStore.stats.user.createdAt).toLocaleDateString() }}</p>
            </div>
        </div>
        <div class="stats-grid">
            <div class="stat-card card">
                <span class="stat-number">{{ profileStore.stats.stats.testsCreated }}</span>
                <span class="stat-label">Создано тестов</span>
            </div>
            <div class="stat-card card">
                <span class="stat-number">{{ profileStore.stats.stats.testsPassed }}</span>
                <span class="stat-label">Пройдено тестов</span>
            </div>
            <div class="stat-card card">
                <span class="stat-number">{{ profileStore.stats.stats.groupsCount }}</span>
                <span class="stat-label">Групп</span>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
@use '../../../styles/pages/profile';
</style>