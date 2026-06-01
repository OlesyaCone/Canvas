<script setup lang="ts">
import Personal from "./workspace/Personal.vue";
import Completed from "./workspace/Completed.vue";
import Creating from "./workspace/Creating.vue";
import Playing from "./workspace/Playing.vue";
import Editing from "./workspace/Editing.vue";
import MyGroups from "./groups/MyGroups.vue";
import CreateGroup from "./groups/CreateGroup.vue";
import GroupView from "./groups/GroupView.vue";

const props = defineProps<{
  currentPage: "personal" | "completed" | "creating" | "playing" | "editing" | "myGroups" | "createGroup" | "groupView";
  playingTestId?: string | null;
  editingTestId?: string | null;
  viewingGroupId?: string | null;
}>();

const emit = defineEmits<{
  (e: "start-test", testId: string): void;
  (e: "edit-test", testId: string): void;
  (e: "back-to-tests"): void;
  (e: "select-group", groupId: string): void;
  (e: "create-group"): void;
  (e: "back-to-groups"): void;
}>();
</script>

<template>
  <div class="canvas">
    <Personal v-if="currentPage === 'personal'" @start="(id: string) => emit('start-test', id)"
      @edit="(id: string) => emit('edit-test', id)" />
    <Completed v-else-if="currentPage === 'completed'" @start="(id: string) => emit('start-test', id)" />
    <Creating v-else-if="currentPage === 'creating'" @back="emit('back-to-tests')" />
    <Playing v-else-if="currentPage === 'playing' && playingTestId" :testId="playingTestId"
      @back="emit('back-to-tests')" />
    <Editing v-else-if="currentPage === 'editing' && editingTestId" :testId="editingTestId"
      @back="emit('back-to-tests')" />
    <MyGroups v-else-if="currentPage === 'myGroups'" @select="(id: string) => emit('select-group', id)"
      @create="emit('create-group')" />
    <CreateGroup v-else-if="currentPage === 'createGroup'" @back="emit('back-to-groups')"
      @created="(id: string) => emit('select-group', id)" />
    <GroupView v-else-if="currentPage === 'groupView' && viewingGroupId" :groupId="viewingGroupId"
      @back="emit('back-to-groups')" @startTest="(id: string) => emit('start-test', id)" />
  </div>
</template>