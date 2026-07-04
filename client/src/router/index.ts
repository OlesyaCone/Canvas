import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "personal",
      component: () => import("../components/tests/Personal.vue"),
    },
    {
      path: "/create",
      name: "creating",
      component: () => import("../components/tests/Creating.vue"),
    },
    {
      path: "/play/:testId/:groupTestId?/:groupId?",
      name: "playing",
      component: () => import("../components/tests/Playing.vue"),
      props: true,
    },
    {
      path: "/edit/:testId",
      name: "editing",
      component: () => import("../components/tests/Editing.vue"),
      props: true,
    },
    {
      path: "/public",
      name: "public",
      component: () => import("../components/tests/Public.vue"),
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("../components/user/Profile.vue"),
    },
    {
      path: "/profile/:userId",
      name: "userProfile",
      component: () => import("../components/user/Profile.vue"),
      props: true,
    },
    {
      path: "/groups",
      name: "myGroups",
      component: () => import("../components/groups/MyGroups.vue"),
    },
    {
      path: "/groups/create",
      name: "createGroup",
      component: () => import("../components/groups/CreateGroup.vue"),
    },
    {
      path: "/groups/:groupId",
      name: "groupView",
      component: () => import("../components/groups/GroupView.vue"),
      props: true,
    },
  ],
});

export default router;
