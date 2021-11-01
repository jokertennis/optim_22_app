<!-- プロフィール編集フォーム -->

<template>
  <section>
    <b-button
      label="編集"
      type="is-light"
      outlined
      @click="isComponentModalActive = true"
    />
    <b-modal
      v-model="isComponentModalActive"
      has-modal-card
      trap-focus
      :destroy-on-hide="false"
      aria-role="dialog"
      aria-label="Example Modal"
      aria-modal
    >
      <template #default="props">
        <modal-form
          @close="props.close"
          @displayMessage="isMessageModalActive = true"
        />
      </template>
    </b-modal>
    <b-modal v-model="isMessageModalActive">
      <b-message type="is-success" has-icon>
        編集が完了しました
        <br />
        マイページに移動します
      </b-message>
    </b-modal>
  </section>
</template>

<script>
import * as api from "API";
import { iconStyle } from "iconStyle";

const ModalForm = {
  data() {
    return {
      file: null,
      profile: {
        user_id: null,
        username: "",
        email: "",
        icon: "",
        comment: "",
        SNS: {
          Github: "",
          Twitter: "",
          Facebook: ""
        }
      },
      password: "",
      confirm_password: "",
      invalid: false,
      errorMessage: "",
      iconStyle
    };
  },
  watch: {
    profile: {
      handler() {
        // 少なくともユーザ名、メールアドレス、パスワードが入力されていればアラートを消す
        if (this.isNeedsEntered()) {
          this.invalid = false;
        }
      },
      deep: true
    },
    file() {
      // アイコン画像がアップロードされたらbase64で変換する
      this.convertIcon(this.file);
    }
  },
  methods: {
    // 画像をbase64で変換
    convertIcon(file) {
      const ICON_WIDTH = 500; // リサイズ後のアイコンの幅
      const ICON_HEIGHT = 500; // リサイズ後のアイコンの高さ

      // png画像でなければ中止
      if (file.type !== "image/png") {
        return;
      }

      const reader = new FileReader();
      const icon = new Image();
      reader.onload = () => {
        icon.onload = () => {
          // 画像の種類の取得
          const iconType = icon.src.substring(5, icon.src.indexOf(";"));
          // 画像のリサイズ
          let width, height;
          if (icon.width > icon.height) {
            // 横長の場合
            const ratio = icon.height / icon.width;
            width = ICON_WIDTH;
            height = ICON_WIDTH * ratio;
          } else {
            // 縦長の場合
            const ratio = icon.width / icon.height;
            width = ICON_HEIGHT * ratio;
            height = ICON_HEIGHT;
          }

          // リサイズされた画像の大きさのキャンバスを作成
          const canvas = document.createElement("canvas");
          canvas.setAttribute("width", width);
          canvas.setAttribute("height", height);
          // キャンバスにリサイズされた画像を描画
          const ctx = canvas.getContext("2d");
          ctx.drawImage(icon, 0, 0, width, height);
          // キャンバスから画像をbase64で取得
          const base64 = canvas.toDataURL(iconType);
          this.profile.icon = base64;
        };
        icon.src = reader.result;
      };
      reader.readAsDataURL(file);
    },
    // 少なくともユーザ名、メールアドレス、パスワードが入力されているかのチェック
    isNeedsEntered() {
      return (
        this.profile.username.length *
          this.profile.email.length *
          this.password.length *
          this.confirm_password.length >
        0
      );
    },
    // パスワードが一致しているかチェック
    isPasswordsCorrect() {
      return this.password === this.confirm_password;
    },
    // プロフィール編集処理
    async editProfile() {
      // すべての情報が正しく入力されていれば
      if (this.isNeedsEntered() && this.isPasswordsCorrect()) {
        const access_token = localStorage.getItem("access_token");
        const user = {
          user_id: this.profile.user_id,
          username: this.profile.username,
          email: this.profile.email,
          password: this.password,
          icon: this.profile.icon,
          comment: this.profile.comment,
          SNS: {
            Github: this.profile.SNS.Github,
            Twitter: this.profile.SNS.Twitter,
            Facebook: this.profile.SNS.Facebook
          }
        };
        api.editProfile(this, user, access_token);
      } else {
        this.invalid = true;
        if (!this.isNeedsEntered()) {
          this.errorMessage = "必須項目を入力してください";
        } else if (!this.isPasswordsCorrect()) {
          this.errorMessage = "パスワードが違います";
        }
      }
    }
  },
  async created() {
    const user_id = localStorage.getItem("user_id");
    const access_token = localStorage.getItem("access_token");
    this.profile = await api.getProfile(this, user_id, access_token);
  },
  /* html */
  template: `
    <form action="">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title has-text-centered">プロフィールの編集</p>
          <button type="button" class="delete" @click="$emit('close')" />
        </header>
        <section class="modal-card-body">
          <b-message v-show="invalid" type="is-danger">
            {{ errorMessage }}
          </b-message>
          <b-field label="ユーザ名">
            <div class="control has-icons-left">
              <b-icon icon="account" size="is-small"></b-icon>
              <b-input
                type="text"
                v-model="profile.username"
                placeholder="username"
                required
              />
            </div>
          </b-field>
          <b-field label="アイコン画像（.png形式）">
            <p class="control">
              <div v-show="!!profile.icon" class="mr-3" :style="iconStyle(48, profile.icon)" />
              <div class="control has-icons-left">
                <b-icon icon="image" size="is-small" />
                <b-input :value="!!file?file.name:''" disabled/>
              </div>
            </p>
            <b-field class="file is-primary">
              <b-upload class="file-label" v-model="file" accept=".png">
                <span class="file-cta">
                  <b-icon class="file-icon" icon="upload" />
                  <span class="file-label">アップロード</span>
                </span>
              </b-upload>
            </b-field>
          </b-field>
          <b-field label="メールアドレス">
            <div class="control has-icons-left">
              <b-icon icon="email" size="is-small"></b-icon>
              <b-input
                type="email"
                v-model="profile.email"
                placeholder="email@example.com"
                required
              />
            </div>
          </b-field>
          <b-field label="自己紹介">
            <div class="control has-icons-left">
              <b-icon icon="comment" size="is-small"></b-icon>
              <b-input
                v-model="profile.comment"
                placeholder="よろしくお願いします！"
              />
            </div>
          </b-field>
          <b-field label="SNSアカウントのID" grouped group-multiline>
            <p class="control">
              <b-field>
                <p class="control">
                  <span class="button is-static is-flex is-align-items-center" style="background-color: #171516;">
                    <b-icon class="is-inline-flex" icon="github" type="is-light" />
                  </span>
                </p>
                <b-input v-model="profile.SNS.Github" placeholder="Github" />
              </b-field>
            </p>
            <p class="control">
              <b-field>
                <p class="control">
                  <span class="button is-static is-flex is-align-items-center" style="background-color: #1D9BF0;">
                    <b-icon class="is-inline-flex" icon="twitter" type="is-light" />
                  </span>
                </p>
                <b-input v-model="profile.SNS.Twitter" placeholder="Twitter" />
              </b-field>
            </p>
            <p class="control">
              <b-field>
                <p class="control">
                  <span class="button is-static is-flex is-align-items-center" style="background-color: #1877F2;">
                    <b-icon class="is-inline-flex" icon="facebook" type="is-light" />
                  </span>
                </p>
                <b-input v-model="profile.SNS.Facebook" placeholder="Facebook" />
              </b-field>
            </p>
          </b-field>
          <b-field label="パスワード">
            <div class="control has-icons-left">
              <b-icon icon="key" size="is-small"></b-icon>
              <b-input
                type="password"
                v-model="password"
                password-reveal
                placeholder="Enter password"
                required
              />
            </div>
          </b-field>
          <b-field label="パスワード(再入力)">
            <div class="control has-icons-left">
              <b-icon icon="key-outline" size="is-small"></b-icon>
              <b-input
                type="password"
                v-model="confirm_password"
                password-reveal
                placeholder="Confirm password"
                required
              >
              </b-input>
            </div>
          </b-field>
        </section>
        <footer class="modal-card-foot is-flex is-justify-content-center">
          <b-button label="編集する" type="is-primary" @click="editProfile" />
          <b-button label="キャンセル" @click="$emit('close')" />
        </footer>
      </div>
    </form>
  `
};

export default {
  data() {
    return {
      isComponentModalActive: false,
      isMessageModalActive: false
    };
  },
  watch: {
    // ユーザがプロフィール編集成功メッセージを閉じたらページをリロードする
    isMessageModalActive(newVal, oldVal) {
      if (newVal === false && oldVal === true) {
        const user_id = localStorage.getItem("user_id");
        this.$router.go({ name: "MyPage", params: { user_id } });
      }
    }
  },
  components: {
    ModalForm
  }
};
</script>
