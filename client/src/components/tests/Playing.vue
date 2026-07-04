<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import api from "../../api/axios";
import { useTestStore } from "../../stores/test";

const router = useRouter();
const testStore = useTestStore();

const props = defineProps<{
  testId: string;
  groupTestId?: string;
  groupId?: string;
}>();

const currentIndex = ref(0);
const selectedAnswers = ref<Record<number, string>>({});
const submitted = ref(false);
const score = ref(0);
const total = ref(0);

const test = computed(function () {
  return testStore.currentTest;
});

const totalQuestions = computed(function () {
  return test.value?.question?.length || 0;
});

const currentQuestion = computed(function () {
  if (!test.value || !test.value.question) {
    return null;
  }
  return test.value.question[currentIndex.value] ?? null;
});

onMounted(async function () {
  try {
    await testStore.fetchTestById(props.testId);
  } catch (e) {
    console.error("Ошибка загрузки теста:", e);
  }
});

function goNext() {
  if (currentIndex.value < totalQuestions.value - 1) {
    currentIndex.value++;
  }
}

function goPrev() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
}

async function submitAnswers() {
  const answers = Object.entries(selectedAnswers.value).map(function ([index, answer]) {
    return {
      questionIndex: parseInt(index),
      answer,
    };
  });

  try {
    if (props.groupTestId && props.groupId) {
      const { data } = await api.post(
        `/groups/${props.groupId}/tests/${props.groupTestId}/submit`,
        { answers },
      );
      score.value = data.score;
      total.value = data.total;
    } else {
      const { data } = await api.post(`/tests/${props.testId}/submit`, { answers });
      score.value = data.score;
      total.value = data.total;
    }
    submitted.value = true;
    testStore.passedTests = [];
  } catch (e) {
    console.error("Ошибка отправки ответов:", e);
  }
}

function goBack() {
  router.back();
}
</script>

<template>
  <div class="playing-test">
    <div v-if="!test" class="loading">Загрузка теста...</div>

    <template v-else>
      <div class="test-header">
        <button class="btn btn-secondary" @click="goBack">← Назад</button>
        <h2 class="page-title">{{ test.title }}</h2>
        <div class="progress-badge">{{ currentIndex + 1 }} / {{ totalQuestions }}</div>
      </div>

      <div v-if="submitted" class="result-card card">
        <h3>Результат</h3>
        <p class="score">{{ score }} / {{ total }}</p>
        <button class="btn btn-primary" @click="goBack">Вернуться</button>
      </div>

      <div v-else-if="currentQuestion" class="question-card">
        <p class="question-text">{{ currentQuestion.question }}</p>

        <div v-if="currentQuestion.img" class="question-image">
          <img
            :src="
              currentQuestion.img.startsWith('http')
                ? currentQuestion.img
                : `/api${currentQuestion.img}`
            "
            alt="изображение вопроса"
          />
        </div>

        <div class="answers-grid">
          <label
            v-for="(ans, i) in currentQuestion.answers"
            :key="i"
            class="answer-option"
            :class="{ selected: selectedAnswers[currentIndex] === ans }"
          >
            <input
              v-model="selectedAnswers[currentIndex]"
              type="radio"
              :name="`question-${currentIndex}`"
              :value="ans"
            />
            {{ ans }}
          </label>
        </div>

        <div class="nav-buttons">
          <button v-if="currentIndex > 0" class="btn btn-secondary" @click="goPrev">← Назад</button>
          <div v-else class="btn-placeholder"></div>

          <button v-if="currentIndex < totalQuestions - 1" class="btn btn-primary" @click="goNext">
            Далее →
          </button>
          <button
            v-else
            class="btn btn-primary submit-btn"
            :disabled="Object.keys(selectedAnswers).length !== totalQuestions"
            @click="submitAnswers"
          >
            Отправить ответы
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss">
@use "../../../styles/pages/tests";
</style>
