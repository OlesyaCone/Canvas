<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useTestStore } from "../../stores/test";
import type { Question } from "../../types";

interface EditableQuestion {
  question: string;
  answers: string[];
  correctAnswer: string;
  imgFile: File | null;
  imgPreview: string;
}

const router = useRouter();
const testStore = useTestStore();

const props = defineProps<{ testId: string }>();

const title = ref("");
const description = ref("");
const imgFile = ref<File | null>(null);
const existingCover = ref("");

const questions = ref<EditableQuestion[]>([]);

onMounted(async function () {
  await testStore.fetchTestById(props.testId);
  const t = testStore.currentTest;
  if (t) {
    title.value = t.title;
    description.value = t.description || "";
    existingCover.value = t.img || "";
    questions.value = t.question.map(function (q: Question) {
      return {
        question: q.question,
        answers: [...q.answers],
        correctAnswer: q.correctAnswer,
        imgFile: null,
        imgPreview: q.img
          ? q.img.startsWith("http")
            ? q.img
            : `http://localhost:5000${q.img}`
          : "",
      };
    });
  }
});

function addQuestion() {
  questions.value.push({
    question: "",
    answers: ["", ""],
    correctAnswer: "",
    imgFile: null,
    imgPreview: "",
  });
}

function removeQuestion(index: number) {
  questions.value.splice(index, 1);
}

function addAnswer(qIndex: number) {
  questions.value[qIndex].answers.push("");
}

function removeAnswer(qIndex: number, aIndex: number) {
  if (questions.value[qIndex].answers.length > 1) {
    questions.value[qIndex].answers.splice(aIndex, 1);
  }
}

function onCoverChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files?.[0]) {
    imgFile.value = target.files[0];
  }
}

function onQuestionImageChange(e: Event, qIndex: number) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (ev) {
      questions.value[qIndex].imgPreview = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    questions.value[qIndex].imgFile = file;
  }
}

async function submit() {
  const formData = new FormData();
  formData.append("title", title.value);
  formData.append("description", description.value);

  if (imgFile.value) {
    formData.append("img", imgFile.value);
  }

  const questionsData = questions.value.map(function (q) {
    return {
      question: q.question,
      answers: q.answers.filter(function (a) { return a.trim() !== ""; }),
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
    await testStore.updateTest(props.testId, formData);
    router.push({ name: "personal" });
  }
  catch (e) {
    console.error("Ошибка обновления теста:", e);
  }
}

function onBack() {
  router.push({ name: "personal" });
}
</script>

<template>
  <div class="create-test">
    <h2 class="page-title">Редактирование теста</h2>

    <div class="card">
      <div class="form-group">
        <label>Название теста</label>
        <input v-model="title" type="text" class="input" />
      </div>

      <div class="form-group">
        <label>Описание</label>
        <textarea v-model="description" class="input" rows="3"></textarea>
      </div>

      <div class="form-group">
        <label>Обложка теста</label>
        <div v-if="existingCover && !imgFile" class="image-preview">
          <img :src="existingCover.startsWith('http') ? existingCover : `http://localhost:5000${existingCover}`"
            alt="текущая обложка" />
        </div>
        <div class="file-upload-wrapper">
          <label for="edit-cover" class="file-upload-btn">
            Выберите файл
          </label>
          <input id="edit-cover" type="file" accept="image/*" class="file-input-hidden" @change="onCoverChange" />
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

        <div class="form-group">
          <label>Текст вопроса</label>
          <input v-model="q.question" class="input" placeholder="Введите вопрос" />
        </div>

        <div class="form-group">
          <label>Изображение вопроса</label>
          <div v-if="q.imgPreview" class="image-preview">
            <img :src="q.imgPreview" alt="предпросмотр" />
          </div>
          <div class="file-upload-wrapper">
            <label :for="'edit-q-img-' + idx" class="file-upload-btn">
              Выберите файл
            </label>
            <input :id="'edit-q-img-' + idx" type="file" accept="image/*" class="file-input-hidden"
              @change="(e: Event) => onQuestionImageChange(e, idx)" />
            <span class="file-name">
              {{ q.imgFile ? q.imgFile.name : "Файл не выбран" }}
            </span>
          </div>
        </div>

        <div class="form-group">
          <label>Варианты ответов</label>
          <div v-for="(_, aIdx) in q.answers" :key="aIdx" class="answer-row">
            <input v-model="q.answers[aIdx]" class="input" :placeholder="'Ответ ' + (aIdx + 1)" />
            <button v-if="q.answers.length > 1" class="btn-icon" title="Удалить вариант"
              @click="removeAnswer(idx, aIdx)">
              ✕
            </button>
          </div>
          <button class="btn btn-add" @click="addAnswer(idx)">
            + Добавить вариант
          </button>
        </div>

        <div class="form-group">
          <label>Правильный ответ</label>
          <input v-model="q.correctAnswer" class="input" placeholder="Введите правильный ответ" />
        </div>
      </div>

      <button class="btn btn-add" @click="addQuestion">
        + Добавить вопрос
      </button>
    </div>

    <div class="form-actions">
      <button class="btn btn-primary" @click="submit">
        Сохранить изменения
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