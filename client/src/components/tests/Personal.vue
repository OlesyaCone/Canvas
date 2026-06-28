<script setup lang="ts">
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTestStore } from "../../stores/test";
import TestCard from "./TestCard.vue";

const route = useRoute();
const router = useRouter();
const testStore = useTestStore();

watch(
  function () {
    return route.name;
  },
  function (name) {
    if (name === "personal") {
      testStore.fetchMyTests();
    }
  },
  { immediate: true },
);

function onStart(testId: string) {
  router.push({ name: "playing", params: { testId } });
}

function onEdit(testId: string) {
  router.push({ name: "editing", params: { testId } });
}
</script>

<template>
  <div class="tests-container">
    <h2 class="page-title">Мои тесты</h2>

    <div v-if="testStore.myTests.length === 0" class="empty">У вас пока нет созданных тестов.</div>

    <div v-else class="tests-grid">
      <TestCard
        v-for="test in testStore.myTests"
        :key="test._id"
        :test="test"
        @start="(id: string) => onStart(id)"
        @edit="(id: string) => onEdit(id)"
      />
    </div>
  </div>
</template>

<style lang="scss">
@use "../../../styles/pages/tests";
</style>
