<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useTestStore } from "../../stores/test";

const router = useRouter();
const testStore = useTestStore();

interface QuestionData {
  question: string;
  answers: string[];
  correctAnswer: string;
  imgFile: File | null;
  imgPreview: string;
}

interface NewQuestionData {
  question: string;
  answers: string[];
  correctAnswer: string;
  imgFile: File | null;
  imgPreview: string;
}

const title = ref("");
const description = ref("");
const isPublic = ref(false);
const imgFile = ref<File | null>(null);

const questions = ref<QuestionData[]>([]);

const newQuestion = ref<NewQuestionData>({
  question: "",
  answers: ["", ""],
  correctAnswer: "",
  imgFile: null,
  imgPreview: "",
});

function addAnswer() {
  newQuestion.value.answers.push("");
}

function removeAnswer(index: number) {
  if (newQuestion.value.answers.length > 1) {
    newQuestion.value.answers.splice(index, 1);
  }
}

function onQuestionImageChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    newQuestion.value.imgFile = file;
    const reader = new FileReader();
    reader.onload = function (ev) {
      newQuestion.value.imgPreview = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

function addQuestion() {
  const q = newQuestion.value;
  if (!q.question.trim() || !q.correctAnswer.trim()) {
    return;
  }

  const filteredAnswers = q.answers
    .map(function (a) { return a.trim(); })
    .filter(function (a) { return a !== ""; });

  const uniqueAnswers = [...new Set(filteredAnswers)];

  if (!uniqueAnswers.includes(q.correctAnswer.trim())) {
    uniqueAnswers.push(q.correctAnswer.trim());
  }

  if (uniqueAnswers.length === 0) {
    return;
  }

  questions.value.push({
    question: q.question.trim(),
    answers: uniqueAnswers,
    correctAnswer: q.correctAnswer.trim(),
    imgFile: q.imgFile,
    imgPreview: q.imgPreview,
  });

  newQuestion.value = {
    question: "",
    answers: ["", ""],
    correctAnswer: "",
    imgFile: null,
    imgPreview: "",
  };
}

function removeQuestion(index: number) {
  questions.value.splice(index, 1);
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files?.[0]) {
    imgFile.value = target.files[0];
  }
}

async function submit() {
  const formData = new FormData();
  formData.append("title", title.value);
  formData.append("description", description.value);
  formData.append("visibility", isPublic.value ? "public" : "private");

  if (imgFile.value) {
    formData.append("img", imgFile.value);
  }

  const questionsData = questions.value.map(function (q) {
    return {
      question: q.question,
      answers: q.answers,
      correctAnswer: q.correctAnswer,
    };
  });
  formData.append("questions", JSON.stringify(questionsData));

  questions.value.forEach(function (q, idx) {
    if (q.imgFile) {
      formData.append("questionImgs", q.imgFile);
      formData.append("questionImgIndexes", idx.toString());
    }
  });

  try {
    await testStore.createTest(formData);
    router.push({ name: "personal" });
  }
  catch (e) {
    console.error("Ошибка создания теста:", e);
  }
}

function onBack() {
  router.push({ name: "personal" });
}
</script>

<template>
  <div class="create-test">
    <h2 class="page-title">Создание теста</h2>

    <div class="card">
      <div class="form-group">
        <label>Название теста</label>
        <input v-model="title" type="text" class="input" placeholder="Введите название" />
      </div>

      <div class="form-group">
        <label>Описание</label>
        <textarea v-model="description" class="input" rows="3" placeholder="Описание теста"></textarea>
      </div>

      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" v-model="isPublic" />
          <span>Сделать тест публичным</span>
        </label>
      </div>

      <div class="form-group">
        <label>Обложка теста</label>
        <div class="file-upload-wrapper">
          <label for="test-cover" class="file-upload-btn">
            Выберите файл
          </label>
          <input id="test-cover" type="file" accept="image/*" class="file-input-hidden" @change="onFileChange" />
          <span class="file-name">
            {{ imgFile ? imgFile.name : "Файл не выбран" }}
          </span>
        </div>
      </div>
    </div>

    <div class="questions-section">
      <div class="section-header">
        <h3>Вопросы ({{ questions.length }})</h3>
      </div>

      <div v-for="(q, idx) in questions" :key="idx" class="question-card">
        <div class="question-header">
          <span class="question-number">Вопрос {{ idx + 1 }}</span>
          <button class="btn-icon" title="Удалить вопрос" @click="removeQuestion(idx)">
            ✕
          </button>
        </div>
        <p class="question-text">{{ q.question }}</p>
        <div v-if="q.imgPreview" class="question-image">
          <img :src="q.imgPreview" alt="изображение вопроса" />
        </div>
        <ul class="answers-list">
          <li v-for="(ans, i) in q.answers" :key="i" :class="{ correct: ans === q.correctAnswer }">
            {{ ans }}
            <span v-if="ans === q.correctAnswer" class="check-mark"> ✓</span>
          </li>
        </ul>
        <div class="correct-answer-label">
          Правильный ответ: <strong>{{ q.correctAnswer }}</strong>
        </div>
      </div>

      <div class="add-question-form card">
        <h4>Добавить вопрос</h4>

        <div class="form-group">
          <label>Текст вопроса</label>
          <input v-model="newQuestion.question" class="input" placeholder="Введите вопрос" />
        </div>

        <div class="form-group">
          <label>Изображение вопроса (необязательно)</label>
          <div class="file-upload-wrapper">
            <label for="question-img" class="file-upload-btn">
              Выберите файл
            </label>
            <input id="question-img" type="file" accept="image/*" class="file-input-hidden"
              @change="onQuestionImageChange" />
            <span class="file-name">
              {{ newQuestion.imgFile ? newQuestion.imgFile.name : "Файл не выбран" }}
            </span>
          </div>
          <div v-if="newQuestion.imgPreview" class="image-preview">
            <img :src="newQuestion.imgPreview" alt="предпросмотр" />
          </div>
        </div>

        <div class="form-group">
          <label>Варианты ответов</label>
          <div v-for="(_, i) in newQuestion.answers" :key="i" class="answer-row">
            <input v-model="newQuestion.answers[i]" class="input" :placeholder="'Ответ ' + (i + 1)" />
            <button v-if="newQuestion.answers.length > 1" class="btn-icon" title="Удалить вариант"
              @click="removeAnswer(i)">
              ✕
            </button>
          </div>
          <button class="btn btn-add" @click="addAnswer">
            + Добавить вариант
          </button>
        </div>

        <div class="form-group">
          <label>Правильный ответ</label>
          <input v-model="newQuestion.correctAnswer" class="input" placeholder="Введите правильный ответ" />
          <small class="hint">
            Этот вариант автоматически добавится в список ответов, если его там нет.
          </small>
        </div>

        <button class="btn btn-add" @click="addQuestion">
          Добавить вопрос
        </button>
      </div>
    </div>

    <div class="form-actions">
      <button class="btn btn-primary" :disabled="!title || questions.length === 0" @click="submit">
        Создать тест
      </button>
      <button class="btn btn-secondary" @click="onBack">
        Отмена
      </button>
    </div>
  </div>
</template>

<style lang="scss">
@use "../../../styles/pages/tests";
</style>