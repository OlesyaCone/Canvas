import { defineStore } from "pinia";
import { ref } from "vue";
import type { Test, TestComment } from "../types";
import api from "../api/axios";

export const usePublicStore = defineStore("public", () => {
  const tests = ref<Test[]>([]);
  const commentsMap = ref<Record<string, TestComment[]>>({});
  const loading = ref(false);

  const fetchPublicTests = async (search?: string, sort?: string) => {
    loading.value = true;
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (sort) params.sort = sort;
      const { data } = await api.get<Test[]>("/auth/tests/public", { params });
      tests.value = data;
    } catch (e) {
      console.error("Ошибка загрузки:", e);
    } finally {
      loading.value = false;
    }
  };

  const toggleReaction = async (testId: string, type: "like" | "dislike") => {
    const test = tests.value.find((t) => t._id === testId);
    if (!test) return;

    const opposite = type === "like" ? "dislike" : "like";
    const key = (type + "s") as keyof Test;

    if (test.myReaction === type) {
      test.myReaction = null;
      (test[key] as number)--;
    } else if (test.myReaction === opposite) {
      test.myReaction = type;
      (test[key] as number)++;
      (test[(opposite + "s") as keyof Test] as number)--;
    } else {
      test.myReaction = type;
      (test[key] as number)++;
    }

    await api.post(`/auth/tests/${testId}/reaction`, { type });
  };

  const fetchComments = async (testId: string) => {
    const { data } = await api.get<TestComment[]>(
      `/auth/tests/${testId}/comments`,
    );
    commentsMap.value[testId] = data;
    const test = tests.value.find((t) => t._id === testId);
    if (test) test.commentsCount = data.length;
  };

  const addComment = async (testId: string, text: string) => {
    const { data } = await api.post<TestComment>(
      `/auth/tests/${testId}/comments`,
      { text },
    );
    if (!commentsMap.value[testId]) commentsMap.value[testId] = [];
    commentsMap.value[testId].push(data);
    const test = tests.value.find((t) => t._id === testId);
    if (test) test.commentsCount = (test.commentsCount || 0) + 1;
  };

  const getComments = (testId: string): TestComment[] => {
    return commentsMap.value[testId] || [];
  };

  return {
    tests,
    commentsMap,
    loading,
    fetchPublicTests,
    toggleReaction,
    fetchComments,
    addComment,
    getComments,
  };
});
