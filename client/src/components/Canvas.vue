<script setup lang="ts">
import Personal from './workspace/Personal.vue';
import Completed from './workspace/Completed.vue';
import Creating from './workspace/Creating.vue';
import Playing from './workspace/Playing.vue';
import Editing from './workspace/Editing.vue';

const props = defineProps<{
  currentPage: 'personal' | 'completed' | 'creating' | 'playing' | 'editing';
  playingTestId?: string | null;
  editingTestId?: string | null;
}>();

const emit = defineEmits<{
  (e: 'start-test', testId: string): void;
  (e: 'back-to-tests'): void;
  (e: 'edit-test', testId: string): void;
}>();
</script>

<template>
  <div class="canvas">
    <Personal
      v-if="currentPage === 'personal'"
      @start="(id: string) => emit('start-test', id)"
      @edit="(id: string) => emit('edit-test', id)"
    />
    <Completed v-else-if="currentPage === 'completed'" @start="(id: string) => emit('start-test', id)" />
    <Creating v-else-if="currentPage === 'creating'" />
    <Playing v-else-if="currentPage === 'playing' && playingTestId" :testId="playingTestId" @back="emit('back-to-tests')" />
    <Editing v-else-if="currentPage === 'editing' && editingTestId" :testId="editingTestId" @back="emit('back-to-tests')" />
  </div>
</template>