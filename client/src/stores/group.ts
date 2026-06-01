import { defineStore } from "pinia";
import { ref } from "vue";
import type { Group, GroupTest } from "../types/index";
import api from "../api/axios";

export const useGroupStore = defineStore("group", () => {
  const myGroups = ref<Group[]>([]);
  const currentGroup = ref<Group | null>(null);
  const groupTests = ref<GroupTest[]>([]);
  const groupResults = ref<GroupTest[]>([]);
  const loading = ref(false);

  const fetchMyGroups = async () => {
    loading.value = true;
    try {
      const { data } = await api.get("/groups/my");
      myGroups.value = data;
    } catch (e) {
      console.error("Ошибка загрузки групп:", e);
    } finally {
      loading.value = false;
    }
  };

  const fetchGroup = async (id: string) => {
    loading.value = true;
    try {
      const { data } = await api.get(`/groups/${id}`);
      currentGroup.value = data;
    } catch (e) {
      console.error("Ошибка загрузки группы:", e);
    } finally {
      loading.value = false;
    }
  };

  const createGroup = async (formData: FormData) => {
    const { data } = await api.post("/groups", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    myGroups.value.unshift(data);
    return data;
  };

  const joinGroup = async (inviteCode: string) => {
    const { data } = await api.post(`/groups/join`, { inviteCode });
    myGroups.value.unshift(data);
    return data;
  };

  const leaveGroup = async (groupId: string) => {
    await api.post(`/groups/${groupId}/leave`);
    myGroups.value = myGroups.value.filter((g) => g._id !== groupId);
  };

  const kickMember = async (groupId: string, userId: string) => {
    await api.post(`/groups/${groupId}/kick/${userId}`);
    if (currentGroup.value) {
      currentGroup.value.members = currentGroup.value.members.filter(
        (m) => m._id !== userId,
      );
    }
  };

  const promoteMember = async (groupId: string, userId: string) => {
    const { data } = await api.post(`/groups/${groupId}/promote/${userId}`);
    if (currentGroup.value) currentGroup.value.moderators = data.moderators;
  };

  const fetchGroupTests = async (groupId: string) => {
    const { data } = await api.get(`/groups/${groupId}/tests`);
    groupTests.value = data;
    return data;
  };

  const assignTest = async (
    groupId: string,
    testId: string,
    deadline?: string,
  ) => {
    const { data } = await api.post(`/groups/${groupId}/tests`, {
      testId,
      deadline,
    });
    groupTests.value.unshift(data);
    return data;
  };

  const fetchGroupResults = async (groupId: string) => {
    const { data } = await api.get(`/groups/${groupId}/results`);
    groupResults.value = data;
    return data;
  };

  return {
    myGroups,
    currentGroup,
    groupTests,
    groupResults,
    loading,
    fetchMyGroups,
    fetchGroup,
    createGroup,
    joinGroup,
    leaveGroup,
    kickMember,
    promoteMember,
    fetchGroupTests,
    assignTest,
    fetchGroupResults,
  };
});
