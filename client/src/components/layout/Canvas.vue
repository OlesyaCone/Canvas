<script setup lang="ts">
import Personal from "../tests/Personal.vue";
import Completed from "../tests/Completed.vue";
import Creating from "../tests/Creating.vue";
import Playing from "../tests/Playing.vue";
import Editing from "../tests/Editing.vue";
import Public from "../tests/Public.vue";
import Profile from "../user/Profile.vue";
import MyGroups from "../groups/MyGroups.vue";
import CreateGroup from "../groups/CreateGroup.vue";
import GroupView from "../groups/GroupView.vue";

defineProps<{
  currentPage: "personal" | "completed" | "creating" | "playing" | "editing" | "public" | "profile" | "myGroups" | "createGroup" | "groupView";
  playingTestId?: string | null;
  playingGroupTestId?: string | null;
  editingTestId?: string | null;
  viewingGroupId?: string | null;
  viewingProfileId?: string | null;
}>();

const emit = defineEmits<{
  (e: "start-test", testId: string, groupTestId?: string): void;
  (e: "edit-test", testId: string): void;
  (e: "back-to-tests"): void;
  (e: "select-group", groupId: string): void;
  (e: "create-group"): void;
  (e: "back-to-groups"): void;
  (e: "view-profile", userId: string): void;
}>();
</script>

<template>
  <div class="canvas">
    <Personal v-if="currentPage === 'personal'" @start="(id: string) => emit('start-test', id)"
      @edit="(id: string) => emit('edit-test', id)" />
    <Completed v-else-if="currentPage === 'completed'" @start="(id: string) => emit('start-test', id)" />
    <Creating v-else-if="currentPage === 'creating'" @back="emit('back-to-tests')" />
    <Playing v-else-if="currentPage === 'playing' && playingTestId" :testId="playingTestId"
      :groupTestId="playingGroupTestId || undefined" @back="emit('back-to-tests')" />
    <Editing v-else-if="currentPage === 'editing' && editingTestId" :testId="editingTestId"
      @back="emit('back-to-tests')" />
    <Public v-else-if="currentPage === 'public'" @startTest="(id: string) => emit('start-test', id)"
      @viewProfile="(userId: string) => emit('view-profile', userId)" />
    <Profile v-else-if="currentPage === 'profile'" :userId="viewingProfileId || undefined" />
    <MyGroups v-else-if="currentPage === 'myGroups'" @select="(id: string) => emit('select-group', id)"
      @create="emit('create-group')" />
    <CreateGroup v-else-if="currentPage === 'createGroup'" @back="emit('back-to-groups')"
      @created="(id: string) => emit('select-group', id)" />
    <GroupView v-else-if="currentPage === 'groupView' && viewingGroupId" :groupId="viewingGroupId"
      @back="emit('back-to-groups')"
      @startTest="(testId: string, groupTestId?: string) => emit('start-test', testId, groupTestId)" />
  </div>
</template>