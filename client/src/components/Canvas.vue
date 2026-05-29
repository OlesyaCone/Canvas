<script setup lang="ts">
import Personal from './workspace/Personal.vue';
import Completed from './workspace/Completed.vue';
import Creating from './workspace/Creating.vue';
import Playing from './workspace/Playing.vue';

defineProps<{
  currentPage: 'personal' | 'completed' | 'creating' | 'playing';
  playingTestId?: string | null;
}>();

const emit = defineEmits<{
  (e: 'start-test', testId: string): void;
  (e: 'back-to-tests'): void;
}>();
</script>

<template>
  <div class="canvas">
    <Personal
      v-if="currentPage === 'personal'"
      @start="(testId: string) => emit('start-test', testId)"
    />
    <Completed
      v-else-if="currentPage === 'completed'"
      @start="(testId: string) => emit('start-test', testId)"
    />
    <Creating v-else-if="currentPage === 'creating'" />
    <Playing
      v-else-if="currentPage === 'playing' && playingTestId"
      :testId="playingTestId"
      @back="emit('back-to-tests')"
    />
  </div>
</template>