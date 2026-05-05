<script setup lang="ts">
import { ref, computed } from "vue";
import AvatarGeneratorModal from "./avatar/Avatar.vue";
import { useAuthStore } from '../../store/auth'

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const activeTab = ref<"profile" | "chat">("profile");
const showAvatarModal = ref(false);

const username = ref("");
const avatarPreview = ref("https://via.placeholder.com/100");
const fileInput = ref<HTMLInputElement>();
const authStore = useAuthStore()

const chatSettings = ref({
  primaryColor: "#0084ff",
  fontSize: 16,
  messageSpacing: 12,
  showAvatars: true,
  showTimestamps: true,
  enterToSend: false,
});

const colorPresets = [
  "#0084ff",
  "#00c851",
  "#ff4444",
  "#aa66cc",
  "#ffbb33",
  "#2BBBAD",
  "#4285F4",
  "#DB4437",
];

const previewMessage = computed(() => ({
  text: "Привет! Это пример сообщения",
  time: new Date().toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }),
}));

const handleAvatarUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const resetAvatar = () => {
  avatarPreview.value = "https://via.placeholder.com/100";
};

const handleAvatarGenerated = (avatarUrl: string) => {
  avatarPreview.value = avatarUrl;
  showAvatarModal.value = false;
};

const generateUsername = async () => {
  try {
    const response = await fetch("https://randomuser.me/api/");
    const data = await response.json();
    const user = data.results[0];
    username.value = user.login.username;
  } catch (error) {
    console.error("Ошибка генерации имени:", error);
    username.value = "user_" + Math.random().toString(36).substring(2, 10);
  }
};

const saveSettings = () => {
  console.log("Сохранено:", {
    username: username.value,
    avatar: avatarPreview.value,
    chatSettings: chatSettings.value,
  });

  authStore.completeProfileSetup()

  emit("close");
};
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Настройки</h2>
          <button class="close-btn" @click="emit('close')">×</button>
        </div>

        <div class="tabs">
          <button
            class="tab"
            :class="{ active: activeTab === 'profile' }"
            @click="activeTab = 'profile'"
          >
            <svg
              class="tab-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Профиль
          </button>
          <button
            class="tab"
            :class="{ active: activeTab === 'chat' }"
            @click="activeTab = 'chat'"
          >
            <svg
              class="tab-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              ></path>
            </svg>
            Чат
          </button>
        </div>

        <div class="modal-body">
          <div v-if="activeTab === 'profile'" class="tab-content">
            <div class="avatar-section">
              <div class="avatar-label">Аватар профиля</div>
              <div class="avatar-upload">
                <div class="avatar-preview">
                  <img :src="avatarPreview" alt="avatar" />
                </div>
                <div class="avatar-actions">
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="hidden-input"
                    @change="handleAvatarUpload"
                  />
                  <button class="btn-secondary" @click="resetAvatar">
                    Сбросить
                  </button>
                  <button class="btn-primary" @click="showAvatarModal = true">
                    Создать аватар
                  </button>
                  <button class="avatar-edit-btn" @click="fileInput?.click()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 20h9M16.5 3.5L20 7l-9 9H7v-4l9-9z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div class="input-group">
              <label class="input-label">Имя пользователя</label>
              <div class="input-with-button">
                <input
                  v-model="username"
                  type="text"
                  class="input-field"
                  placeholder="Введите имя"
                />
                <button class="btn-secondary" @click="generateUsername">
                  Сгенерировать
                </button>
              </div>
            </div>
          </div>

          <div v-else class="tab-content">
            <div class="settings-group">
              <label class="settings-label">Цвет сообщений</label>
              <div class="color-picker">
                <div
                  v-for="color in colorPresets"
                  :key="color"
                  class="color-option"
                  :style="{ backgroundColor: color }"
                  :class="{ active: chatSettings.primaryColor === color }"
                  @click="chatSettings.primaryColor = color"
                ></div>
                <input
                  v-model="chatSettings.primaryColor"
                  type="color"
                  class="color-input"
                />
              </div>
            </div>

            <div class="settings-group">
              <div class="settings-header">
                <label class="settings-label">Размер шрифта</label>
                <span class="settings-value"
                  >{{ chatSettings.fontSize }}px</span
                >
              </div>
              <input
                v-model.number="chatSettings.fontSize"
                type="range"
                min="12"
                max="24"
                step="1"
                class="slider"
              />
            </div>

            <div class="preview-section">
              <div class="preview-label">Предпросмотр</div>
              <div class="preview-message">
                <div class="message bot-message">
                  <div
                    class="message-text"
                    :style="{ fontSize: chatSettings.fontSize + 'px' }"
                  >
                    {{ previewMessage.text }}
                  </div>
                  <div v-if="chatSettings.showTimestamps" class="message-time">
                    {{ previewMessage.time }}
                  </div>
                </div>

                <div
                  class="message user-message"
                  :style="{
                    marginTop: chatSettings.messageSpacing + 'px',
                    backgroundColor: chatSettings.primaryColor,
                  }"
                >
                  <div
                    class="message-text"
                    :style="{ fontSize: chatSettings.fontSize + 'px' }"
                  >
                    {{ previewMessage.text }}
                  </div>
                  <div v-if="chatSettings.showTimestamps" class="message-time">
                    {{ previewMessage.time }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="emit('close')">Отмена</button>
          <button class="btn-primary" @click="saveSettings">
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <AvatarGeneratorModal
    :is-open="showAvatarModal"
    @close="showAvatarModal = false"
    @generate="handleAvatarGenerated"
  />
</template>