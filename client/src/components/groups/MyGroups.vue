<script setup lang="ts">
import { onMounted } from "vue";
import { useGroupStore } from "../../stores/group";
import noPhoto from "../../assets/nophoto.png";

const emit = defineEmits<{
  (e: "select", groupId: string): void;
  (e: "create"): void;
}>();

const groupStore = useGroupStore();

onMounted(() => {
  groupStore.fetchMyGroups();
});
</script>

<template>
  <div class="my-groups">
    <div class="section-header">
      <h2 class="page-title">Мои группы</h2>
      <button class="btn btn-primary" @click="emit('create')">Создать группу</button>
    </div>

    <div v-if="groupStore.loading" class="loading">Загрузка...</div>
    <div v-else-if="groupStore.myGroups.length === 0" class="empty">
      Вы пока не состоите ни в одной группе.
    </div>
    <div v-else class="groups-grid">
      <div
        v-for="group in groupStore.myGroups"
        :key="group._id"
        class="group-card"
        @click="emit('select', group._id)"
      >
        <div class="group-avatar">
          <img :src="group.avatar || noPhoto" alt="group avatar" />
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

<style lang="scss">
@use '../../../styles/pages/groups';
</style>