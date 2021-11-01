<!-- マイページ -->

<template>
  <div class="container">
    <section class="hero is-primary is-small mb-3">
      <b-tooltip
        style="position: absolute"
        :label="
          profile.comment !== '' ? profile.comment : 'よろしくお願いします！'
        "
        type="is-light"
        position="is-right"
        always
      >
        <div class="ml-3 mt-3 mb-6" :style="iconStyle(64, profile.icon)" />
      </b-tooltip>
      <div
        class="hero-body is-flex pt-0 pb-5"
        :style="{ 'margin-bottom': !myself ? '20px' : 0 }"
      >
        <p class="title mb-0 pt-2" style="margin-left: 64px">
          {{ profile.username }}
        </p>
        <profile-editor
          v-if="myself"
          class="is-light ml-auto mt-5"
          :profile="profile"
        />
      </div>
    </section>
    <section class="mb-3 is-flex is-justify-content-space-evenly">
      <b-taglist v-if="!!profile.SNS.Github" class="m-0" attached>
        <b-tag style="background-color: #171516">
          <b-icon icon="github" type="is-light" />
        </b-tag>
        <b-tag type="is-light">
          <a :href="`https://github.com/${profile.SNS.Github}`">
            @{{ profile.SNS.Github }}
          </a>
        </b-tag>
      </b-taglist>
      <b-taglist v-if="!!profile.SNS.Twitter" class="m-0" attached>
        <b-tag style="background-color: #1d9bf0">
          <b-icon icon="twitter" type="is-light" />
        </b-tag>
        <b-tag type="is-light">
          <a :href="`https://twitter.com/${profile.SNS.Twitter}`">
            @{{ profile.SNS.Twitter }}
          </a>
        </b-tag>
      </b-taglist>
      <b-taglist v-if="!!profile.SNS.Facebook" class="m-0" attached>
        <b-tag style="background-color: #1877f2">
          <b-icon icon="facebook" type="is-light" />
        </b-tag>
        <b-tag type="is-light">
          <a :href="`https://www.facebook.com/${profile.SNS.Facebook}`">
            @{{ profile.SNS.Facebook }}
          </a>
        </b-tag>
      </b-taglist>
    </section>
    <section class="mb-3">
      <b-tabs type="is-boxed">
        <b-tab-item>
          <template #header>
            <b-icon icon="account-question-outline"></b-icon>
            <span>
              過去にした依頼
              <b-tag rounded> {{ profile.requests.length }} </b-tag>
            </span>
          </template>
          <b-table
            :loading="loading"
            :data="profile.requests"
            :default-sort="['date', 'desc']"
          >
            <b-table-column
              cell-class="is-vcentered"
              field="state"
              label="状態"
              width="10%"
              centered
              v-slot="props"
            >
              <b-tag
                :type="props.row.finish === false ? 'is-success' : 'is-danger'"
              >
                {{ props.row.finish === false ? "受付中" : "終了" }}
              </b-tag>
            </b-table-column>
            <b-table-column
              cell-class="is-vcentered"
              field="date"
              label="依頼日時"
              width="10%"
              sortable
              centered
              v-slot="props"
            >
              {{ new Date(props.row.createdat).toLocaleDateString() }}
              <br />
              {{ new Date(props.row.createdat).toLocaleTimeString() }}
            </b-table-column>
            <b-table-column
              cell-class="is-vcentered"
              field="request"
              label="依頼名"
              width="20%"
              sortable
              v-slot="props"
            >
              <router-link
                :to="{
                  name: 'RequestPage',
                  params: { request_id: props.row.request_id }
                }"
              >
                {{ props.row.requestname }}
              </router-link>
            </b-table-column>
            <b-table-column
              cell-class="is-vcentered"
              field="detail"
              label="詳細"
              width="35%"
              v-slot="props"
            >
              {{ props.row.content }}
            </b-table-column>
            <b-table-column
              cell-class="is-vcentered"
              field="engineer"
              label="参加者"
              width="25%"
              v-slot="props"
            >
              <router-link
                v-for="engineer in props.row.engineers"
                :key="engineer.user_id"
                :to="{
                  name: 'MyPage',
                  params: { user_id: engineer.user_id }
                }"
              >
                <b-tooltip :label="engineer.username">
                  <div :style="iconStyle(48, engineer.icon)" />
                </b-tooltip>
              </router-link>
            </b-table-column>
          </b-table>
        </b-tab-item>
        <b-tab-item>
          <template #header>
            <b-icon icon="account-edit-outline"></b-icon>
            <span>
              過去に受けた依頼
              <b-tag rounded> {{ profile.submissions.length }} </b-tag>
            </span>
          </template>
          <b-table
            :loading="loading"
            :data="profile.submissions"
            :default-sort="['date', 'desc']"
          >
            <b-table-column
              cell-class="is-vcentered"
              field="state"
              label="状態"
              width="10%"
              centered
              v-slot="props"
            >
              <b-tag
                :type="props.row.finish === false ? 'is-success' : 'is-danger'"
              >
                {{ props.row.finish === false ? "受付中" : "終了" }}
              </b-tag>
            </b-table-column>
            <b-table-column
              cell-class="is-vcentered"
              field="date"
              label="依頼日時"
              width="10%"
              sortable
              centered
              v-slot="props"
            >
              {{ new Date(props.row.createdat).toLocaleDateString() }}
              <br />
              {{ new Date(props.row.createdat).toLocaleTimeString() }}
            </b-table-column>
            <b-table-column
              cell-class="is-vcentered"
              field="client"
              label="依頼者"
              width="10%"
              centered
              v-slot="props"
            >
              <router-link
                :to="{
                  name: 'MyPage',
                  params: { user_id: props.row.request.client.user_id }
                }"
              >
                <b-tooltip :label="props.row.request.client.username">
                  <div :style="iconStyle(64, props.row.request.client.icon)" />
                </b-tooltip>
              </router-link>
            </b-table-column>
            <b-table-column
              cell-class="is-vcentered"
              field="request"
              label="依頼名"
              width="20%"
              sortable
              v-slot="props"
            >
              <router-link
                :to="{
                  name: 'RequestPage',
                  params: { request_id: props.row.request_id }
                }"
              >
                {{ props.row.request.requestname }}
              </router-link>
            </b-table-column>
            <b-table-column
              cell-class="is-vcentered"
              field="detail"
              label="詳細"
              width="30%"
              v-slot="props"
            >
              {{ props.row.content }}
            </b-table-column>
            <b-table-column
              cell-class="is-vcentered"
              field="engineer"
              label="提出物"
              width="20%"
              v-slot="props"
            >
              <router-link
                :to="{
                  name: 'SubmissionPage',
                  params: { submission_id: props.row.submission_id }
                }"
              >
                提出物
              </router-link>
            </b-table-column>
          </b-table>
        </b-tab-item>
      </b-tabs>
    </section>
    <section v-if="myself" class="mb-3 is-flex is-justify-content-center">
      <b-button label="ログアウト" type="is-primary" outlined @click="logout" />
    </section>
  </div>
</template>

<script>
import ProfileEditor from "@/components/ProfileEditor";
import * as api from "API";
import { iconStyle } from "iconStyle";

export default {
  data() {
    return {
      loggedin: false,
      profile: {
        comment: "",
        SNS: {
          Github: "",
          Twitter: "",
          Facebook: ""
        },
        requests: [],
        submissions: []
      },
      myself: false,
      iconStyle
    };
  },
  watch: {
    async $route(to, from) {
      this.loading = true;
      const refresh_token = this.$cookies.get("refresh_token");
      this.loggedin = refresh_token !== null ? true : false;
      const user_id = localStorage.getItem("user_id");
      this.myself = this.$route.params.user_id == user_id && this.loggedin;
      const access_token = localStorage.getItem("access_token");
      this.profile = await api.getProfile(this,
        this.$route.params.user_id,
        access_token
      );
      this.loading = false;
    }
  },
  methods: {
    // ログアウトする
    logout() {
      // cookieからリフレッシュトークンを削除
      this.$cookies.remove("refresh_token");
      // ホームページに移動する
      this.$router.push("/");
    }
  },
  components: {
    "profile-editor": ProfileEditor
  },
  async created() {
    this.loading = true;
    const refresh_token = this.$cookies.get("refresh_token");
    this.loggedin = refresh_token !== null ? true : false;
    const user_id = localStorage.getItem("user_id");
    this.myself = this.$route.params.user_id == user_id && this.loggedin;
    const access_token = localStorage.getItem("access_token");
    this.profile = await api.getProfile(this,
      this.$route.params.user_id,
      access_token
    );
    this.loading = false;
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
