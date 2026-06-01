<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useGroupStore } from "../../stores/group";
import { useTestStore } from "../../stores/test";

const props = defineProps<{
  groupId: string;
}>();

const emit = defineEmits<{
  (e: "back"): void;
  (e: "startTest", testId: string): void;
}>();

const groupStore = useGroupStore();
const testStore = useTestStore();
const inviteCodeCopied = ref(false);
const selectedTest = ref('');

onMounted(async () => {
  await groupStore.fetchGroup(props.groupId);
  await groupStore.fetchGroupTests(props.groupId);
  await testStore.fetchMyTests();
});

const copyInviteCode = () => {
  if (groupStore.currentGroup?.inviteCode) {
    navigator.clipboard.writeText(groupStore.currentGroup.inviteCode);
    inviteCodeCopied.value = true;
    setTimeout(() => (inviteCodeCopied.value = false), 2000);
  }
};

const handleAssignTest = async (testId: string) => {
  await groupStore.assignTest(props.groupId, testId);
};
</script>

<template>
  <div class="group-view" v-if="groupStore.currentGroup">
    <button class="btn btn-secondary" @click="emit('back')">← Назад</button>

    <div class="group-header">
      <div class="group-avatar">
        <img
          :src="groupStore.currentGroup.avatar || 'https://via.placeholder.com/120'"
          alt="group avatar"
        />
      </div>
      <div class="group-info">
        <h2>{{ groupStore.currentGroup.name }}</h2>
        <p v-if="groupStore.currentGroup.description">
          {{ groupStore.currentGroup.description }}
        </p>
        <div class="invite-section">
          <code>{{ groupStore.currentGroup.inviteCode }}</code>
          <button class="btn btn-small" @click="copyInviteCode">
            {{ inviteCodeCopied ? "Скопировано!" : "Копировать код" }}
          </button>
        </div>
      </div>
    </div>

    <div class="tabs">
      <button class="tab active">Участники ({{ groupStore.currentGroup.members.length }})</button>
      <button class="tab">Тесты ({{ groupStore.groupTests.length }})</button>
    </div>

    <div class="members-list">
      <div
        v-for="member in groupStore.currentGroup.members"
        :key="member._id"
        class="member-card"
      >
        <img
          :src="member.avatar || 'https://via.placeholder.com/32'"
          class="member-avatar"
          alt="avatar"
        />
        <span class="member-name">{{ member.username }}</span>
        <span v-if="member._id === groupStore.currentGroup.admin._id" class="badge">Админ</span>
        <span v-else-if="groupStore.currentGroup.moderators.some((m) => m._id === member._id)" class="badge moderator">
          Модератор
        </span>
      </div>
    </div>

    <div class="tests-section">
      <h3>Назначенные тесты</h3>
      <div
        v-for="gt in groupStore.groupTests"
        :key="gt._id"
        class="test-card"
      >
        <div class="test-info">
          <h4>{{ gt.test.title }}</h4>
          <p v-if="gt.deadline">Дедлайн: {{ new Date(gt.deadline).toLocaleDateString() }}</p>
        </div>
        <button class="btn btn-primary" @click="emit('startTest', gt.test._id)">Пройти</button>
      </div>

      <div class="assign-test" v-if="testStore.myTests.length > 0">
        <h3>Назначить тест</h3>
        <select v-model="selectedTest" class="input">
          <option value="">Выберите тест</option>
          <option v-for="t in testStore.myTests" :key="t._id" :value="t._id">
            {{ t.title }}
          </option>
        </select>
        <button
          class="btn btn-primary"
          @click="handleAssignTest(selectedTest)"
          :disabled="!selectedTest"
        >
          Назначить
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use '../../../styles/pages/groups';
</style>