<script setup lang="ts">
import { ref } from 'vue';
import { useTestStore } from '../../stores/test';

const emit = defineEmits<{ (e: 'back'): void }>();

const testStore = useTestStore();

const title = ref('');
const description = ref('');
const imgFile = ref<File | null>(null);

const questions = ref<
    {
        question: string;
        answers: string[];
        correctAnswer: string;
        imgFile: File | null;
        imgPreview: string;
    }[]
>([]);

const newQuestion = ref({
    question: '',
    answers: ['', ''],
    correctAnswer: '',
    imgFile: null as File | null,
    imgPreview: '' as string,
});

const addAnswer = () => {
    newQuestion.value.answers.push('');
};

const removeAnswer = (index: number) => {
    if (newQuestion.value.answers.length > 1) {
        newQuestion.value.answers.splice(index, 1);
    }
};

const onQuestionImageChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
        newQuestion.value.imgFile = file;
        const reader = new FileReader();
        reader.onload = (ev) => {
            newQuestion.value.imgPreview = ev.target?.result as string;
        };
        reader.readAsDataURL(file);
    }
};

const addQuestion = () => {
    const q = newQuestion.value;
    if (!q.question.trim() || !q.correctAnswer.trim()) return;

    const filteredAnswers = q.answers
        .map((a) => a.trim())
        .filter((a) => a !== '');
    const uniqueAnswers = [...new Set(filteredAnswers)];
    if (!uniqueAnswers.includes(q.correctAnswer.trim())) {
        uniqueAnswers.push(q.correctAnswer.trim());
    }
    if (uniqueAnswers.length === 0) return;

    questions.value.push({
        question: q.question.trim(),
        answers: uniqueAnswers,
        correctAnswer: q.correctAnswer.trim(),
        imgFile: q.imgFile,
        imgPreview: q.imgPreview,
    });

    newQuestion.value = {
        question: '',
        answers: ['', ''],
        correctAnswer: '',
        imgFile: null,
        imgPreview: '',
    };
};

const removeQuestion = (index: number) => {
    questions.value.splice(index, 1);
};

const onFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files?.[0]) {
        imgFile.value = target.files[0];
    }
};

const submit = async () => {
    const formData = new FormData();
    formData.append('title', title.value);
    formData.append('description', description.value);
    if (imgFile.value) {
        formData.append('img', imgFile.value);
    }

    const questionsData = questions.value.map((q) => ({
        question: q.question,
        answers: q.answers,
        correctAnswer: q.correctAnswer,
    }));
    formData.append('questions', JSON.stringify(questionsData));

    questions.value.forEach((q, idx) => {
        if (q.imgFile) {
            formData.append('questionImgs', q.imgFile);
            formData.append('questionImgIndexes', idx.toString());
        }
    });

    try {
        await testStore.createTest(formData);
        title.value = '';
        description.value = '';
        questions.value = [];
        imgFile.value = null;
        emit('back');
    } catch (e) {
        console.error('Ошибка создания теста:', e);
    }
};
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
        <label>Обложка теста</label>
        <div class="file-upload-wrapper">
          <label for="test-cover" class="file-upload-btn">Выберите файл</label>
          <input id="test-cover" type="file" accept="image/*" @change="onFileChange" class="file-input-hidden" />
          <span class="file-name">{{ imgFile ? imgFile.name : 'Файл не выбран' }}</span>
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
          <button class="btn-icon" @click="removeQuestion(idx)" title="Удалить вопрос">✕</button>
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
            <label for="question-img" class="file-upload-btn">Выберите файл</label>
            <input id="question-img" type="file" accept="image/*" @change="onQuestionImageChange" class="file-input-hidden" />
            <span class="file-name">{{ newQuestion.imgFile ? newQuestion.imgFile.name : 'Файл не выбран' }}</span>
          </div>
          <div v-if="newQuestion.imgPreview" class="image-preview">
            <img :src="newQuestion.imgPreview" alt="предпросмотр" />
          </div>
        </div>

        <div class="form-group">
          <label>Варианты ответов</label>
          <div v-for="(_, i) in newQuestion.answers" :key="i" class="answer-row">
            <input v-model="newQuestion.answers[i]" class="input" :placeholder="'Ответ ' + (i + 1)" />
            <button v-if="newQuestion.answers.length > 1" class="btn-icon" @click="removeAnswer(i)" title="Удалить вариант">
              ✕
            </button>
          </div>
          <button class="btn btn-add" @click="addAnswer">+ Добавить вариант</button>
        </div>

        <div class="form-group">
          <label>Правильный ответ</label>
          <input v-model="newQuestion.correctAnswer" class="input" placeholder="Введите правильный ответ" />
          <small class="hint">
            Этот вариант автоматически добавится в список ответов, если его там нет.
          </small>
        </div>

        <button class="btn btn-add" @click="addQuestion">Добавить вопрос</button>
      </div>
    </div>

    <button class="btn btn-primary submit-btn" @click="submit" :disabled="!title || questions.length === 0">
      Создать тест
    </button>
  </div>
</template>

<style lang="scss">
@use '../../../styles/pages/tests';
</style>