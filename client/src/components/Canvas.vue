<script setup lang="ts">
import Personal from './workspace/Personal.vue';
import Completed from './workspace/Completed.vue';
import Creating from './workspace/Creating.vue';

defineProps<{
  currentPage: 'personal' | 'completed' | 'creating';
}>();
</script>

<template>
  <div class="canvas">
    <Personal v-if="currentPage === 'personal'" />
    <Completed v-else-if="currentPage === 'completed'" />
    <Creating v-else-if="currentPage === 'creating'" />
  </div>
</template>