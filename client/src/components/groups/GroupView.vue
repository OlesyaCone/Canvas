<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useGroupStore } from "../../stores/group";
import { useTestStore } from "../../stores/test";
import { useAuthStore } from "../../stores/auth";
import noPhoto from "../../assets/nophoto.png";

const props = defineProps<{ groupId: string }>();

const emit = defineEmits<{
  (e: "back"): void;
  (e: "startTest", testId: string): void;
}>();

const groupStore = useGroupStore();
const testStore = useTestStore();
const authStore = useAuthStore();
const inviteCodeCopied = ref(false);
const selectedTest = ref("");
const deadline = ref("");
const activeTab = ref<"members" | "tests">("members");

const isAdmin = computed(() => authStore.user?.id === groupStore.currentGroup?.admin._id);
const isModerator = computed(() => groupStore.currentGroup?.moderators.some((m) => m._id === authStore.user?.id));

const getAvatarUrl = (avatar?: string) => {
  if (!avatar) return noPhoto;
  if (avatar.startsWith("http") || avatar.startsWith("data:")) return avatar;
  return `http://localhost:5000${avatar}`;
};

const loadData = async () => {
  await groupStore.fetchGroup(props.groupId);
  await groupStore.fetchGroupTests(props.groupId);
  await testStore.fetchMyTests();
};

onMounted(loadData);

const copyInviteCode = () => {
  if (groupStore.currentGroup?.inviteCode) {
    navigator.clipboard.writeText(groupStore.currentGroup.inviteCode);
    inviteCodeCopied.value = true;
    setTimeout(() => (inviteCodeCopied.value = false), 2000);
  }
};

const handleAssignTest = async () => {
  if (!selectedTest.value) return;
  await groupStore.assignTest(props.groupId, selectedTest.value, deadline.value || undefined);
  selectedTest.value = "";
  deadline.value = "";
  await groupStore.fetchGroupTests(props.groupId);
};

const handleKick = async (userId: string) => {
  await groupStore.kickMember(props.groupId, userId);
  await groupStore.fetchGroup(props.groupId);
};

const handlePromote = async (userId: string) => {
  await groupStore.promoteMember(props.groupId, userId);
  await groupStore.fetchGroup(props.groupId);
};

const handleDemote = async (userId: string) => {
  await groupStore.demoteMember(props.groupId, userId);
  await groupStore.fetchGroup(props.groupId);
};

const handleLeave = async () => {
  await groupStore.leaveGroup(props.groupId);
  emit("back");
};
</script>

<template>
  <div class="group-view" v-if="groupStore.currentGroup">
    <div class="group-top-bar">
      <button class="btn btn-secondary" @click="emit('back')">← Назад</button>
      <button v-if="!isAdmin" class="btn btn-danger" @click="handleLeave">Покинуть группу</button>
    </div>

    <div class="group-banner">
      <div class="group-avatar-lg">
        <img :src="getAvatarUrl(groupStore.currentGroup.avatar)" alt="group avatar" />
      </div>
      <div class="group-details">
        <h2 class="group-title">{{ groupStore.currentGroup.name }}</h2>
        <p class="group-desc" v-if="groupStore.currentGroup.description">{{ groupStore.currentGroup.description }}</p>
        <div class="invite-row">
          <code class="invite-code">{{ groupStore.currentGroup.inviteCode }}</code>
          <button class="btn btn-primary btn-sm" @click="copyInviteCode">
            {{ inviteCodeCopied ? "✓ Скопировано" : "Копировать" }}
          </button>
        </div>
      </div>
    </div>

    <div class="tabs">
      <button class="tab" :class="{ active: activeTab === 'members' }" @click="activeTab = 'members'">
        Участники ({{ groupStore.currentGroup.members.length }})
      </button>
      <button class="tab" :class="{ active: activeTab === 'tests' }" @click="activeTab = 'tests'">
        Тесты ({{ groupStore.groupTests.length }})
      </button>
    </div>

    <div v-if="activeTab === 'members'" class="members-panel">
      <div v-for="member in groupStore.currentGroup.members" :key="member._id" class="member-row">
        <img :src="getAvatarUrl(member.avatar)" class="member-img" alt="avatar" />
        <span class="member-name">{{ member.username }}</span>
        <span v-if="member._id === groupStore.currentGroup.admin._id" class="role-tag admin">Админ</span>
        <span v-else-if="groupStore.currentGroup.moderators.some((m) => m._id === member._id)"
          class="role-tag moderator">Модер</span>
        <span v-else class="role-tag member">Участник</span>

        <div v-if="isAdmin && member._id !== authStore.user?.id" class="member-controls">
          <button v-if="groupStore.currentGroup.moderators.some((m) => m._id === member._id)" class="btn-icon-sm demote"
            @click="handleDemote(member._id)" title="Понизить до участника">⬇</button>
          <button v-else class="btn-icon-sm promote" @click="handlePromote(member._id)"
            title="Повысить до модератора">⬆</button>
          <button class="btn-icon-sm kick" @click="handleKick(member._id)" title="Кикнуть">✕</button>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'tests'" class="tests-panel">
      <div v-if="(isAdmin || isModerator) && testStore.myTests.length > 0" class="assign-card">
        <h3>Назначить тест</h3>
        <div class="assign-form">
          <select v-model="selectedTest" class="input">
            <option value="">Выберите тест</option>
            <option v-for="t in testStore.myTests" :key="t._id" :value="t._id">{{ t.title }}</option>
          </select>
          <input v-model="deadline" type="datetime-local" class="input" placeholder="Дедлайн" />
          <button class="btn btn-primary" @click="handleAssignTest" :disabled="!selectedTest">Назначить</button>
        </div>
      </div>
      <div v-if="groupStore.groupTests.length === 0" class="empty">Нет назначенных тестов</div>
      <div v-for="gt in groupStore.groupTests" :key="gt._id" class="test-row">
        <div class="test-title">{{ gt.test.title }}</div>
        <div class="test-deadline" v-if="gt.deadline">До {{ new Date(gt.deadline).toLocaleDateString() }}</div>
        <button class="btn btn-primary btn-sm" @click="emit('startTest', gt.test._id)">Пройти</button>
      </div>
    </div>
  </div>
  <div v-else class="loading">Загрузка...</div>
</template>

<style lang="scss">
@use '../../../styles/pages/groups';
</style>