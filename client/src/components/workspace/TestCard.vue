<script setup lang="ts">
import type { Test } from '../../stores/test';
import noPhoto from '../../assets/nophoto.png';
import { computed } from 'vue';

const props = defineProps<{
  test: Test;
}>();

const emit = defineEmits<{
  (e: 'start', testId: string): void;
}>();

const coverImage = computed(() => {
  if (props.test.img?.startsWith('http') || props.test.img?.startsWith('data:')) {
    return props.test.img;
  }
  if (props.test.img) {
    return `http://localhost:5000${props.test.img}`;
  }
  return noPhoto; 
});

const questionCount = computed(() => props.test.question?.length || 0);
</script>

<template>
  <div class="test-card">
    <img :src="coverImage" class="test-image" alt="test cover" />
    <div class="test-body">
      <h3 class="test-title">{{ test.title }}</h3>
      <p class="test-description" v-if="test.description">{{ test.description }}</p>
      <div class="test-meta">
        <span>{{ questionCount }} вопрос(ов)</span>
        <span>Автор: {{ test.author?.username || 'Неизвестный' }}</span>
      </div>
      <div class="test-actions">
        <button class="btn btn-primary" @click="() => { console.log('click', test._id); emit('start', test._id); }">Пройти</button>
      </div>
    </div>
  </div>
</template>