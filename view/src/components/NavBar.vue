<!-- ナビゲーションバー -->

<template>
  <b-navbar>
    <template #brand>
      <b-navbar-item tag="router-link" :to="{ path: '/' }">
        <img src="../assets/logo.png" />
      </b-navbar-item>
    </template>
    <template #start>
      <b-navbar-item href="/"> Home </b-navbar-item>
      <b-navbar-item href="/about"> About </b-navbar-item>
    </template>

    <template #end>
      <b-navbar-item tag="div">
        <div v-if="refresh_token === null" class="columns is-variable is-1">
          <register-form class="column" />
          <login-form class="column" />
        </div>
        <div v-else class="columns">
          <router-link
            :to="{
              name: 'MyPage',
              params: { user_id: user.user_id }
            }"
          >
            <b-tooltip
              class="is-flex is-align-items-center"
              :label="user.username"
              position="is-left"
            >
              <div class="mr-3" :style="iconStyle(40, user.icon)" />
            </b-tooltip>
          </router-link>
        </div>
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script>
import RegisterForm from "@/components/RegisterForm";
import LoginForm from "@/components/LoginForm";
import * as api from "API";
import { iconStyle } from "iconStyle";

export default {
  name: "NavBar",
  data() {
    return {
      refresh_token: null,
      user: {
        user_id: null,
        username: "",
        icon: ""
      },
      iconStyle
    };
  },
  watch: {
    async $route(to, from) {
      this.refresh_token = this.$cookies.get("refresh_token");
      // ログイン済みであればプロフィールを取得
      if (this.refresh_token !== null) {
        const user_id = localStorage.getItem("user_id");
        this.user.user_id = user_id;
        this.user = await api.getProfile(this, user_id);
      }
    }
  },
  components: {
    "register-form": RegisterForm,
    "login-form": LoginForm
  },
  async created() {
    this.refresh_token = this.$cookies.get("refresh_token");
    // ログイン済みであればプロフィールを取得
    if (this.refresh_token !== null) {
      const user_id = localStorage.getItem("user_id");
      this.user.user_id = user_id;
      this.user = await api.getProfile(this, user_id);
    }
  }
};
</script>
