<script setup lang="ts">
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import AvatarGeneratorModal from "./Avatar.vue";
import { useAuthStore } from '../../stores/auth'
import noPhoto from "../../assets/nophoto.png";

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const authStore = useAuthStore()
const { user, userAvatar } = storeToRefs(authStore)

const showAvatarModal = ref(false);
const username = ref(user.value?.username || "");
const avatarPreview = ref(userAvatar.value || noPhoto);
const fileInput = ref<HTMLInputElement>();

watch(userAvatar, (newAvatar) => {
  avatarPreview.value = newAvatar || noPhoto;
});

watch(() => user.value, (newUser) => {
  if (newUser) {
    username.value = newUser.username || "";
  }
});

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
  avatarPreview.value = noPhoto;
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
    username.value = "user_" + Math.random().toString(36).substring(2, 10);
  }
};

const saveSettings = async () => {
  try {
    const file = fileInput.value?.files?.[0];

    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('username', username.value);
      await authStore.completeProfileSetup(username.value, formData);
    } else if (avatarPreview.value.startsWith('data:')) {
      const response = await fetch(avatarPreview.value);
      const blob = await response.blob();
      const mimeType = blob.type || 'image/svg+xml';
      const ext = mimeType.includes('svg') ? 'svg' : 'png';
      const newFile = new File([blob], `avatar.${ext}`, { type: mimeType });
      const formData = new FormData();
      formData.append('avatar', newFile);
      formData.append('username', username.value);
      await authStore.completeProfileSetup(username.value, formData);
    } else {
      await authStore.completeProfileSetup(username.value, avatarPreview.value);
    }

    emit("close");
  } catch (error) {
    console.error('Ошибка сохранения:', error);
  }
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
                  <input ref="fileInput" type="file" accept="image/*" class="hidden-input"
                    @change="handleAvatarUpload" />
                  <button class="btn-secondary" @click="resetAvatar">Сбросить</button>
                  <button class="btn-primary" @click="showAvatarModal = true">Создать аватар</button>
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
                <input v-model="username" type="text" class="input-field" placeholder="Введите имя" />
                <button class="btn-secondary" @click="generateUsername">Сгенерировать</button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="emit('close')">Отмена</button>
          <button class="btn-primary" @click="saveSettings">Сохранить</button>
        </div>
      </div>
    </div>
  </Teleport>

  <AvatarGeneratorModal :is-open="showAvatarModal" @close="showAvatarModal = false" @generate="handleAvatarGenerated" />
</template>

<style lang="scss">
@use '../../../styles/ui/modal';
@use '../../../styles/pages/settings';
</style>