<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useGroupStore } from "../../stores/group";
import noPhoto from "../../assets/nophoto.png";

const emit = defineEmits<{
  (e: "select", groupId: string): void;
  (e: "create"): void;
}>();

const groupStore = useGroupStore();
const inviteCode = ref("");

const getAvatarUrl = (avatar?: string) => {
  if (!avatar) return noPhoto;
  if (avatar.startsWith("http") || avatar.startsWith("data:")) return avatar;
  return `http://localhost:5000${avatar}`;
};

onMounted(() => {
  groupStore.fetchMyGroups();
});

const handleJoin = async () => {
  if (!inviteCode.value.trim()) return;
  try {
    await groupStore.joinGroup(inviteCode.value.trim());
    inviteCode.value = "";
  } catch (e) {
    console.error("Ошибка вступления:", e);
  }
};
</script>

<template>
  <div class="my-groups">
    <div class="section-header">
      <h2 class="page-title">Мои группы</h2>
      <button class="btn btn-primary" @click="emit('create')">Создать группу</button>
    </div>

    <div class="join-section card">
      <h3>Присоединиться к группе</h3>
      <div class="join-form">
        <input v-model="inviteCode" type="text" class="input" placeholder="Введите код приглашения" />
        <button class="btn btn-primary" @click="handleJoin" :disabled="!inviteCode.trim()">Присоединиться</button>
      </div>
    </div>

    <div v-if="groupStore.loading" class="loading">Загрузка...</div>
    <div v-else-if="groupStore.myGroups.length === 0" class="empty">
      Вы пока не состоите ни в одной группе.
    </div>
    <div v-else class="groups-grid">
      <div v-for="group in groupStore.myGroups" :key="group._id" class="group-card" @click="emit('select', group._id)">
        <div class="group-avatar">
          <img :src="getAvatarUrl(group.avatar)" alt="group avatar" />
        </div>
        <div class="group-info">
          <h3 class="group-name">{{ group.name }}</h3>
          <p class="group-description" v-if="group.description">{{ group.description }}</p>
          <div class="group-meta">
            <span>{{ group.members.length }} участников</span>
            <span>Админ: {{ group.admin.username }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../../styles/pages/groups';
</style>