<script setup lang="ts">
import { ref } from "vue";
import AvatarGeneratorModal from "./Avatar.vue";
import { useAuthStore } from '../../stores/auth'

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const showAvatarModal = ref(false);
const username = ref("");
const avatarPreview = ref("https://via.placeholder.com/100");
const fileInput = ref<HTMLInputElement>();
const authStore = useAuthStore()

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
          <h2>Настройки профиля</h2>
          <button class="close-btn" @click="emit('close')">×</button>
        </div>

        <div class="modal-body">
          <div class="tab-content">
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
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="emit('close')">Отмена</button>
          <button class="btn-primary" @click="saveSettings">
            Сохранить
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