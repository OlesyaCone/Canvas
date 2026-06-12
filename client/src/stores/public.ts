import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../api/axios";

export const usePublicStore = defineStore("public", () => {
  const tests = ref<any[]>([]);
  const comments = ref<any[]>([]);
  const loading = ref(false);

  const fetchPublicTests = async (search?: string, sort?: string) => {
    loading.value = true;
    try {
      const params: any = {};
      if (search) params.search = search;
      if (sort) params.sort = sort;
      const { data } = await api.get("/auth/tests/public", { params });
      tests.value = data;
    } catch (e) {
      console.error("Ошибка загрузки:", e);
    } finally {
      loading.value = false;
    }
  };

  const toggleReaction = async (testId: string, type: "like" | "dislike") => {
    await api.post(`/auth/tests/${testId}/reaction`, { type });
    await fetchPublicTests();
  };

  const fetchComments = async (testId: string) => {
    const { data } = await api.get(`/auth/tests/${testId}/comments`);
    comments.value = data;
  };

  const addComment = async (testId: string, text: string) => {
    await api.post(`/auth/tests/${testId}/comments`, { text });
    await fetchComments(testId);
  };

  const deleteComment = async (testId: string, commentId: string) => {
    await api.delete(`/auth/tests/${testId}/comments/${commentId}`);
    await fetchComments(testId);
  };

  return {
    tests,
    comments,
    loading,
    fetchPublicTests,
    toggleReaction,
    fetchComments,
    addComment,
    deleteComment,
  };
});
