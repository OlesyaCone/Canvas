<script setup lang="ts">
import { onMounted } from 'vue';
import { useTestStore } from '../../stores/test';
import TestCard from './TestCard.vue';

const testStore = useTestStore();
onMounted(() => testStore.fetchPassedTests());
</script>

<template>
  <div class="tests-container">
    <h2 class="page-title">Пройденные тесты</h2>
    <div v-if="testStore.loading" class="loading">Загрузка...</div>
    <div v-else-if="testStore.passedTests.length === 0" class="empty">Вы ещё не прошли ни одного теста.</div>
    <div v-else class="tests-grid">
      <TestCard v-for="test in testStore.passedTests" :key="test._id" :test="test" />
    </div>
  </div>
</template>