<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, nextTick, watch } from "vue";
import { io, Socket } from "socket.io-client";
import { useGroupStore } from "../../stores/group";
import { useTestStore } from "../../stores/test";
import { useAuthStore } from "../../stores/auth";
import noPhoto from "../../assets/nophoto.png";
import api from "../../api/axios";

const props = defineProps<{ groupId: string }>();

const emit = defineEmits<{
  (e: "back"): void;
  (e: "startTest", testId: string, groupTestId: string): void;
}>();

const groupStore = useGroupStore();
const testStore = useTestStore();
const authStore = useAuthStore();
const inviteCodeCopied = ref(false);
const selectedTest = ref("");
const deadline = ref("");
const activeTab = ref<"members" | "tests" | "results" | "chat">("members");
const showStats = ref(false);

const chatMessages = ref<any[]>([]);
const chatText = ref("");
const chatContainer = ref<HTMLDivElement>();
let socket: Socket | null = null;

const isAdmin = computed(() => authStore.user?.id === groupStore.currentGroup?.admin._id);
const isModerator = computed(() => groupStore.currentGroup?.moderators.some((m) => m._id === authStore.user?.id));

const getAvatarUrl = (avatar?: string) => {
  if (!avatar) return noPhoto;
  if (avatar.startsWith("http") || avatar.startsWith("data:")) return avatar;
  return `http://localhost:5000${avatar}`;
};

const getUserResult = (gt: any) => {
  if (!gt.results) return null;
  return gt.results.find(
    (r: any) => (r.user?._id || r.user) === authStore.user?.id
  );
};

const isExpired = (deadline: string) => {
  return new Date(deadline) < new Date();
};

const loadData = async () => {
  await groupStore.fetchGroup(props.groupId);
  await groupStore.fetchGroupTests(props.groupId);
  await testStore.fetchMyTests();
  if (isAdmin.value || isModerator.value) {
    await groupStore.fetchGroupResults(props.groupId);
  }
};

const loadMessages = async () => {
  const { data } = await api.get(`/groups/${props.groupId}/messages`);
  chatMessages.value = data;
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

watch(activeTab, (tab) => {
  if (tab === "chat") loadMessages();
});

onMounted(async () => {
  await loadData();

  socket = io("http://localhost:5000", {
    auth: { token: localStorage.getItem("accessToken") },
  });
  socket.emit("joinGroup", props.groupId);
  socket.on("newMessage", (msg) => {
    chatMessages.value.push(msg);
    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
      }
    });
  });
});

onUnmounted(() => {
  if (socket) {
    socket.emit("leaveGroup", props.groupId);
    socket.disconnect();
  }
});

const sendMessage = () => {
  if (!chatText.value.trim() || !socket) return;
  socket.emit("sendMessage", { groupId: props.groupId, text: chatText.value });
  chatText.value = "";
};

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
  await loadData();
};

const handleKick = async (userId: string) => {
  await groupStore.kickMember(props.groupId, userId);
  await loadData();
};

const handlePromote = async (userId: string) => {
  await groupStore.promoteMember(props.groupId, userId);
  await loadData();
};

const handleDemote = async (userId: string) => {
  await groupStore.demoteMember(props.groupId, userId);
  await loadData();
};

const handleLeave = async () => {
  await groupStore.leaveGroup(props.groupId);
  emit("back");
};

const openStats = async (testId: string) => {
  showStats.value = true;
  await groupStore.fetchTestStats(props.groupId, testId);
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
      <button v-if="isAdmin || isModerator" class="tab" :class="{ active: activeTab === 'results' }"
        @click="activeTab = 'results'">
        Результаты
      </button>
      <button class="tab" :class="{ active: activeTab === 'chat' }" @click="activeTab = 'chat'">
        Чат
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
        <template v-if="getUserResult(gt)">
          <div class="test-result">{{ getUserResult(gt)?.score }} / {{ getUserResult(gt)?.total }}</div>
        </template>
        <template v-else-if="gt.deadline && isExpired(gt.deadline)">
          <span class="test-expired">Просрочен</span>
        </template>
        <button v-else class="btn btn-primary btn-sm" @click="emit('startTest', gt.test._id, gt._id)">Пройти</button>
      </div>
    </div>

    <div v-if="activeTab === 'results'" class="results-panel">
      <div v-if="groupStore.groupResults.length === 0" class="empty">Нет результатов</div>
      <div v-for="result in groupStore.groupResults" :key="result._id" class="result-block">
        <div class="result-header-row">
          <h3 class="result-test-title">{{ result.test?.title || 'Тест' }}</h3>
          <button class="btn btn-sm btn-secondary" @click="openStats(result._id)" title="Статистика">📊
            Статистика</button>
        </div>
        <div class="result-table">
          <div class="result-header">
            <span>Участник</span>
            <span>Результат</span>
            <span>Процент</span>
            <span>Дата</span>
          </div>
          <div v-for="r in result.results" :key="(r.user?._id || r.user?.toString())" class="result-row">
            <span>{{ r.user?.username || 'Неизвестный' }}</span>
            <span class="result-score">{{ r.score }} / {{ r.total }}</span>
            <span class="result-percent"
              :class="{ high: (r.score / r.total) >= 0.8, mid: (r.score / r.total) >= 0.5 && (r.score / r.total) < 0.8, low: (r.score / r.total) < 0.5 }">{{
                Math.round((r.score / r.total) * 100) }}%</span>
            <span>{{ new Date(r.completedAt).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'chat'" class="chat-panel">
      <div class="chat-messages" ref="chatContainer">
        <div v-if="chatMessages.length === 0" class="empty">Нет сообщений</div>
        <div v-for="msg in chatMessages" :key="msg._id" class="chat-msg"
          :class="{ mine: msg.user?._id === authStore.user?.id || msg.user === authStore.user?.id }">
          <span>{{ msg.text }}</span>
          <strong>{{ msg.user?.username || 'Неизвестный' }}</strong>
        </div>
      </div>
      <div class="chat-form">
        <input v-model="chatText" class="input" placeholder="Сообщение..." @keyup.enter="sendMessage" />
        <button class="btn btn-primary" @click="sendMessage">Отправить</button>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showStats" class="modal-overlay" @click.self="showStats = false">
        <div class="modal-content stats-modal">
          <div class="modal-header">
            <h2>Статистика теста</h2>
            <button class="close-btn" @click="showStats = false">×</button>
          </div>
          <div class="modal-body" v-if="groupStore.testStats">
            <div class="stats-summary">
              <div class="stat-card">
                <span class="stat-number">{{ groupStore.testStats.totalPassed }}</span>
                <span class="stat-label">Прошли</span>
              </div>
              <div class="stat-card">
                <span class="stat-number">{{ groupStore.testStats.avgScore }}/{{ groupStore.testStats.totalQuestions
                  }}</span>
                <span class="stat-label">Средний балл</span>
              </div>
              <div class="stat-card">
                <span class="stat-number">{{ groupStore.testStats.bestScore }}/{{ groupStore.testStats.totalQuestions
                  }}</span>
                <span class="stat-label">Лучший результат</span>
              </div>
            </div>
            <h3>Распределение результатов</h3>
            <div class="distribution-bars">
              <div v-for="(count, i) in groupStore.testStats.distribution" :key="i" class="dist-bar-row">
                <span class="dist-label">{{ ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'][i as number] }}</span>
                <div class="dist-bar-wrapper">
                  <div class="dist-bar"
                    :style="{ width: Math.max((count / groupStore.testStats.totalPassed) * 100, 2) + '%' }">{{ count }}
                  </div>
                </div>
              </div>
            </div>
            <h3>Сложность вопросов</h3>
            <div v-for="(qs, i) in groupStore.testStats.questionStats" :key="i" class="question-stat-row">
              <span class="qs-number">{{ (i as number) + 1 }}</span>
              <span class="qs-text">{{ qs.question }}</span>
              <div class="qs-bar-wrapper">
                <div class="qs-bar" :style="{ width: qs.percentage + '%' }"
                  :class="{ high: qs.percentage >= 80, mid: qs.percentage >= 50 && qs.percentage < 80, low: qs.percentage < 50 }">
                  {{ qs.percentage }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
  <div v-else class="loading">Загрузка...</div>
</template>

<style lang="scss">
@use '../../../styles/pages/groups';
</style>