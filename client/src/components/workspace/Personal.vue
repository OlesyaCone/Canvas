<script setup lang="ts">
import { onMounted } from 'vue';
import { useTestStore } from '../../stores/test';
import TestCard from './TestCard.vue';

const testStore = useTestStore();
onMounted(() => testStore.fetchMyTests());
</script>

<template>
  <div class="tests-container">
    <h2 class="page-title">Мои тесты</h2>
    <div v-if="testStore.loading" class="loading">Загрузка...</div>
    <div v-else-if="testStore.myTests.length === 0" class="empty">У вас пока нет созданных тестов.</div>
    <div v-else class="tests-grid">
      <TestCard v-for="test in testStore.myTests" :key="test._id" :test="test" />
    </div>
  </div>
</template>