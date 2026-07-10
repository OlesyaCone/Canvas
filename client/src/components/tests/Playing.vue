<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
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
const timeLeft = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

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

const currentTimeLimit = computed(function () {
  return currentQuestion.value?.timeLimit || 0;
});

const formattedTime = computed(function () {
  const minutes = Math.floor(timeLeft.value / 60);
  const seconds = timeLeft.value % 60;
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${seconds} сек`;
});

const timePercent = computed(function () {
  if (currentTimeLimit.value === 0) return 100;
  return (timeLeft.value / currentTimeLimit.value) * 100;
});

onMounted(async function () {
  try {
    await testStore.fetchTestById(props.testId);
    resetTimer();
  } catch (e) {
    console.error("Ошибка загрузки теста:", e);
  }
});

onUnmounted(function () {
  stopTimer();
});

function resetTimer() {
  stopTimer();
  if (currentTimeLimit.value > 0) {
    timeLeft.value = currentTimeLimit.value;
    startTimer();
  }
}

function startTimer() {
  stopTimer();
  if (currentTimeLimit.value === 0) return;
  timer = setInterval(function () {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      goNextOrSubmit();
    }
  }, 1000);
}

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function goNextOrSubmit() {
  if (currentIndex.value < totalQuestions.value - 1) {
    currentIndex.value++;
  } else {
    submitAnswers();
  }
}

watch(currentIndex, function () {
  resetTimer();
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
  if (submitted.value) return;
  stopTimer();

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

      <div v-if="currentTimeLimit > 0" class="timer-bar-wrapper">
        <div
          class="timer-bar"
          :style="{ width: timePercent + '%' }"
          :class="{ warning: timePercent < 25 }"
        ></div>
        <span class="timer-text">{{ formattedTime }}</span>
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
              currentQuestion.img.startsWith('http') || currentQuestion.img.startsWith('data:')
                ? currentQuestion.img
                : `http://localhost:5000${currentQuestion.img}`
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
