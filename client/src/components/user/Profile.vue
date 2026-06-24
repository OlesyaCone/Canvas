<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useProfileStore } from "../../stores/profile";
import { useAuthStore } from "../../stores/auth";
import noPhoto from "../../assets/nophoto.png";

const route = useRoute();
const profileStore = useProfileStore();
const authStore = useAuthStore();

const props = defineProps<{ userId?: string }>();

const avatarSrc = computed(function () {
  if (props.userId && props.userId !== authStore.user?._id) {
    const avatar = profileStore.stats?.user.avatar;
    if (!avatar) return noPhoto;
    if (avatar.startsWith("http") || avatar.startsWith("data:")) return avatar;
    return `http://localhost:5000${avatar}`;
  }
  return authStore.userAvatar || noPhoto;
});

onMounted(function () {
  const uid = props.userId || route.params.userId as string;
  if (uid && uid !== authStore.user?._id) {
    profileStore.fetchUserProfile(uid);
  } else {
    profileStore.fetchProfileStats();
  }
});
</script>

<template>
  <div v-if="profileStore.stats" class="profile-page">
    <h2 class="page-title">
      {{ props.userId && props.userId !== authStore.user?._id ? "Профиль пользователя" : "Мой профиль" }}
    </h2>

    <div class="profile-card card">
      <div class="profile-avatar">
        <img :src="avatarSrc" alt="avatar" />
      </div>
      <div class="profile-info">
        <h2>{{ profileStore.stats.user.username }}</h2>
        <p>{{ profileStore.stats.user.email }}</p>
        <p>
          Дата регистрации: {{ new Date(profileStore.stats.user.createdAt).toLocaleDateString() }}
        </p>
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

    <div v-if="profileStore.stats.publicTests?.length" class="public-tests-section">
      <h3>Публичные тесты</h3>
      <div class="tests-grid">
        <div
          v-for="test in profileStore.stats.publicTests"
          :key="test._id"
          class="test-card"
        >
          <div class="test-image-wrapper">
            <img
              :src="test.img?.startsWith('http') || test.img?.startsWith('data:') ? test.img : test.img ? `http://localhost:5000${test.img}` : noPhoto"
              class="test-image"
              alt="cover"
            />
          </div>
          <div class="test-body">
            <h3 class="test-title">{{ test.title }}</h3>
            <div class="test-meta">
              <span class="meta-item">
                {{ test.question?.length || 0 }} вопросов
              </span>
            </div>
            <div class="test-stats-row">
              <span class="stat-btn">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
                {{ test.likes }}
              </span>
              <span class="stat-btn">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10zM17 2h2.67a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H17" />
                </svg>
                {{ test.dislikes }}
              </span>
              <span class="stat-btn">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {{ test.passes }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use "../../../styles/pages/profile";
</style>