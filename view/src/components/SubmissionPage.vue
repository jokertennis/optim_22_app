<!-- サブミッション詳細ページ -->

<template>
  <div class="container">
    <section class="hero is-primary is-small mb-3">
      <b-tooltip
        style="position: absolute"
        :label="submission.content"
        type="is-light"
        position="is-right"
        always
      >
        <router-link
          :to="{
            name: 'MyPage',
            params: { user_id: submission.engineer.user_id }
          }"
        >
          <div
            class="ml-3 mt-3 mb-6"
            :style="iconStyle(64, submission.engineer.icon)"
          />
        </router-link>
      </b-tooltip>
      <div
        class="hero-body is-flex pt-0 pb-5"
        :style="{ 'margin-bottom': !myself ? '20px' : 0 }"
      >
        <p class="title mb-0 pt-2" style="margin-left: 64px">
          {{ submission.engineer.username }}さんの提出物
        </p>
        <submission-editor
          v-if="myself"
          class="is-light ml-auto mt-5"
          :submission="submission"
        />
      </div>
    </section>
    <section class="mb-3">
      <b-tabs type="is-boxed">
        <b-tab-item>
          <template #header>
            <b-icon icon="file-upload-outline" />
            <span>提出物詳細</span>
          </template>
          <div class="content">
            <ul>
              <li>
                提出日時：
                {{
                  `${new Date(submission.createdat).toLocaleDateString()}
                   ${new Date(submission.createdat).toLocaleTimeString()}`
                }}
              </li>
              <li>
                依頼名　：
                <router-link
                  :to="{
                    name: 'RequestPage',
                    params: { request_id: submission.request.request_id }
                  }"
                >
                  {{ submission.request.requestname }}
                </router-link>
              </li>
              <li>
                <div class="is-flex is-align-items-center">
                  提出者　：
                  <router-link
                    class="is-flex is-align-items-center"
                    :to="{
                      name: 'MyPage',
                      params: { user_id: submission.engineer.user_id }
                    }"
                  >
                    <b-tooltip :label="submission.engineer.username">
                      <div :style="iconStyle(32, submission.engineer.icon)" />
                    </b-tooltip>
                    {{ submission.engineer.username }}
                  </router-link>
                </div>
              </li>
              <li>
                提出物　：
                <a
                  class="is-inline-flex is-align-items-center"
                  :href="submission.URL"
                >
                  <b-icon icon="attachment" />
                  {{ submission.URL }}
                </a>
              </li>
              <li>
                コメント：
                {{ submission.content }}
              </li>
            </ul>
          </div>
        </b-tab-item>
      </b-tabs>
    </section>
  </div>
</template>

<script>
import SubmissionEditor from "@/components/SubmissionEditor";
import * as api from "API";
import { iconStyle } from "iconStyle";

export default {
  data() {
    return {
      loggedin: false,
      myself: false,
      submission: {
        submission_id: null,
        createdat: "",
        request_id: null,
        engineer: {
          user_id: null,
          username: "",
          icon: "",
          comment: "",
          SNS: {}
        },
        content: "",
        URL: "",
        request: {
          request_id: null,
          finish: null,
          createdat: "",
          requestname: "",
          client: {}
        },
        engineers: [],
        content: "",
        submissions: [],
        winner: null
      },
      iconStyle
    };
  },
  components: {
    "submission-editor": SubmissionEditor
  },
  async created() {
    const submission_id = this.$route.params.submission_id;
    this.submission = await api.getsubmission(submission_id);
    const refresh_token = this.$cookies.get("refresh_token");
    this.loggedin = refresh_token !== null ? true : false;
    if (this.loggedin) {
      const user_id = localStorage.getItem("user_id");
      this.myself =
        this.submission.engineer.user_id == user_id && this.loggedin;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
