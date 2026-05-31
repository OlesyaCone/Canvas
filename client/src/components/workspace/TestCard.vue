<script setup lang="ts">
import type { Test } from '../../stores/test';
import { computed } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useTestStore } from '../../stores/test';

const props = defineProps<{ test: Test }>();
const emit = defineEmits<{
  (e: 'start', testId: string): void;
  (e: 'edit', testId: string): void;
}>();

const auth = useAuthStore();
const testStore = useTestStore();
const isAuthor = computed(() => auth.user?.id === props.test.author._id);

const coverImage = computed(() => {
  if (props.test.img?.startsWith('http') || props.test.img?.startsWith('data:')) return props.test.img;
  return props.test.img ? `http://localhost:5000${props.test.img}` : 'https://via.placeholder.com/300x200?text=Test';
});

const handleDelete = async () => {
  await testStore.deleteTest(props.test._id);
};
</script>

<template>
  <div class="test-card">
    <div class="test-image-wrapper">
      <img :src="coverImage" class="test-image" alt="test cover" />
      <div v-if="isAuthor" class="test-actions-overlay">
        <button class="btn-icon-circle" @click="emit('edit', test._id)" title="Редактировать">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="btn-icon-circle btn-icon-danger" @click="handleDelete" title="Удалить">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="test-body">
      <h3 class="test-title">{{ test.title }}</h3>
      <p class="test-description" v-if="test.description">{{ test.description }}</p>
      <div class="test-meta">
        <span class="meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          {{ test.question?.length || 0 }} вопрос(ов)
        </span>
        <span class="meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          {{ test.author?.username || 'Неизвестный' }}
        </span>
      </div>
      <button class="btn-start" @click="emit('start', test._id)">
        Пройти тест
      </button>
    </div>
  </div>
</template>