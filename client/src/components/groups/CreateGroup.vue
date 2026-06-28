<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useGroupStore } from "../../stores/group";

const router = useRouter();
const groupStore = useGroupStore();

const name = ref("");
const description = ref("");
const avatarFile = ref<File | null>(null);

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files?.[0]) {
    avatarFile.value = target.files[0];
  }
}

async function submit() {
  if (!name.value.trim()) {
    return;
  }

  const formData = new FormData();
  formData.append("name", name.value);
  formData.append("description", description.value);

  if (avatarFile.value) {
    formData.append("avatar", avatarFile.value);
  }

  try {
    const group = await groupStore.createGroup(formData);
    router.push({ name: "groupView", params: { groupId: group._id } });
  } catch (e) {
    console.error("Ошибка создания группы:", e);
  }
}

function onBack() {
  router.push({ name: "myGroups" });
}
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
        <textarea
          v-model="description"
          class="input"
          rows="3"
          placeholder="Описание группы"
        ></textarea>
      </div>

      <div class="form-group">
        <label>Аватар группы</label>
        <div class="file-upload-wrapper">
          <label for="group-avatar" class="file-upload-btn"> Выберите файл </label>
          <input
            id="group-avatar"
            type="file"
            accept="image/*"
            class="file-input-hidden"
            @change="onFileChange"
          />
          <span class="file-name">
            {{ avatarFile ? avatarFile.name : "Файл не выбран" }}
          </span>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn btn-primary" :disabled="!name.trim()" @click="submit">Создать</button>
        <button class="btn btn-secondary" @click="onBack">Отмена</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use "../../../styles/pages/groups";
</style>
