<script setup lang="ts">
import { ref } from "vue";
import { useGroupStore } from "../../stores/group";

const emit = defineEmits<{
  (e: "back"): void;
  (e: "created", groupId: string): void;
}>();

const groupStore = useGroupStore();
const name = ref("");
const description = ref("");
const avatarFile = ref<File | null>(null);

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files?.[0]) {
    avatarFile.value = target.files[0];
  }
};

const submit = async () => {
  if (!name.value.trim()) return;
  const formData = new FormData();
  formData.append("name", name.value);
  formData.append("description", description.value);
  if (avatarFile.value) {
    formData.append("avatar", avatarFile.value);
  }

  try {
    const group = await groupStore.createGroup(formData);
    emit("created", group._id);
  } catch (e) {
    console.error("Ошибка создания группы:", e);
  }
};
</script>

<template>
  <div class="create-group">
    <div class="card">
      <h2 class="page-title">Создание группы</h2>
      <div class="form-group">
        <label>Название группы</label>
        <input v-model="name" type="text" class="input" placeholder="Введите название" />
      </div>
      <div class="form-group">
        <label>Описание</label>
        <textarea v-model="description" class="input" rows="3" placeholder="Описание группы"></textarea>
      </div>
      <div class="form-group">
        <label>Аватар группы</label>
        <div class="file-upload-wrapper">
          <label for="group-avatar" class="file-upload-btn">Выберите файл</label>
          <input id="group-avatar" type="file" accept="image/*" @change="onFileChange" class="file-input-hidden" />
          <span class="file-name">{{ avatarFile ? avatarFile.name : "Файл не выбран" }}</span>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" @click="submit" :disabled="!name.trim()">Создать</button>
        <button class="btn btn-secondary" @click="emit('back')">Отмена</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use '../../../styles/pages/groups';
</style>