import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../../api/axios";

export interface Question {
  question: string;
  img?: string;
  answers: string[];
  correctAnswer: string;
}

export interface Test {
  _id: string;
  title: string;
  img?: string;
  description?: string;
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  question: Question[];
  users: string[];
  createdAt: string;
  updatedAt: string;
}

export const useTestStore = defineStore("test", () => {
  const myTests = ref<Test[]>([]);
  const passedTests = ref<Test[]>([]);
  const currentTest = ref<Test | null>(null);
  const loading = ref(false);

  const fetchMyTests = async () => {
    loading.value = true;
    try {
      const { data } = await api.get("/tests/my");
      myTests.value = data;
    } catch (e) {
      console.error("Ошибка загрузки моих тестов:", e);
    } finally {
      loading.value = false;
    }
  };

  const fetchPassedTests = async () => {
    loading.value = true;
    try {
      const { data } = await api.get("/tests/passed");
      passedTests.value = data;
    } catch (e) {
      console.error("Ошибка загрузки пройденных тестов:", e);
    } finally {
      loading.value = false;
    }
  };

  const createTest = async (formData: FormData) => {
    const { data } = await api.post("/tests", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    myTests.value.unshift(data);
    return data;
  };

  const fetchTestById = async (id: string) => {
    const { data } = await api.get(`/tests/${id}`);
    currentTest.value = data;
    return data;
  };

  const updateTest = async (id: string, formData: FormData) => {
    const { data } = await api.patch(`/tests/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const index = myTests.value.findIndex((t) => t._id === id);
    if (index !== -1) myTests.value[index] = data;
    return data;
  };

  const deleteTest = async (id: string) => {
    await api.delete(`/tests/${id}`);
    myTests.value = myTests.value.filter((t) => t._id !== id);
  };

  return {
    myTests,
    passedTests,
    currentTest,
    loading,
    fetchMyTests,
    fetchPassedTests,
    createTest,
    fetchTestById,
    updateTest,
    deleteTest,
  };
});
