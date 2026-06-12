<script setup lang="ts">
import { onMounted } from 'vue';
import { useTestStore } from '../../stores/test.ts';
import TestCard from './TestCard.vue';

const emit = defineEmits<{
  (e: 'start', testId: string): void;
  (e: 'edit', testId: string): void;
}>();

const testStore = useTestStore();
onMounted(() => testStore.fetchMyTests());
</script>

<template>
  <div class="tests-container">
    <h2 class="page-title">Мои тесты</h2>
    <div v-if="testStore.myTests.length === 0" class="empty">У вас пока нет созданных тестов.</div>
    <div v-else class="tests-grid">
      <TestCard v-for="test in testStore.myTests" :key="test._id" :test="test"
        @start="(id: string) => emit('start', id)" @edit="(id: string) => emit('edit', id)" />
    </div>
  </div>
</template>

<style lang="scss">
@use '../../../styles/pages/tests';
</style>