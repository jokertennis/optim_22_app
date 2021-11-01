// パスワードのハッシュ化
async function hashPassword(password) {
    const msgUint8 = new TextEncoder().encode(password); // パスワードをUint8Array(utf-8)としてエンコード
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // エンコードされたパスワードをハッシュ化
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // バッファをbyte配列に変換
    const hashHex = hashArray
        .map(b => b.toString(16).padStart(2, "0"))
        .join(""); // byte配列を16進文字列に変換
    return hashHex;
}


// アクセストークンをJWTからデコード
function accessToken(token) {
    const jwt = require('jsonwebtoken');
    const access_token = jwt.decode(token);
    return access_token;
}


// ユーザ登録API
async function register(component, user) {
    // パスワードのハッシュ化
    const hashHex = await hashPassword(user.password);
    // ログイン情報をサーバに送信し，レスポンスを得る
    const response = await fetch(`${process.env.API}/user`, {
        method: "POST",
        body: JSON.stringify({
            username: user.username,
            email: user.email,
            password: hashHex
        })
    });
    // 登録成功時
    if (response.status === 200) {
        const access_token = response.headers.get("Authorization");
        const refresh_token = response.headers.get("Refresh-Token");
        if (process.env.NODE_ENV === "development") {
            console.log('POST /api/user\tRegister');
            console.log("access_token:");
            console.log(access_token);
            console.log("refresh_token:");
            console.log(refresh_token);
        }
        const user_id = accessToken(access_token).userid;
        if (process.env.NODE_ENV === "development") {
            console.log(`user_id: ${user_id}`);
        }
        // localStorageにユーザIDを保存
        localStorage.setItem("user_id", user_id);
        // localStorageにアクセストークンを保存
        localStorage.setItem("access_token", access_token);
        // cookieにリフレッシュトークンを保存（有効期限: 1ヶ月）
        component.$cookies.set("refresh_token", refresh_token, "1m");
        // 新規登録フォームを閉じる
        component.$emit("close");
        // ユーザ登録成功メッセージを表示する
        component.$emit("displayMessage");
    } else {
        component.errorMessage = "ユーザ登録に失敗しました。入力内容が正しいか確認してください";
        component.invalid = true;
    }
}


// ログインAPI
async function login(component, user) {
    // パスワードのハッシュ化
    const hashHex = await hashPassword(user.password);
    // ログイン情報をサーバに送信し，レスポンスを得る
    const response = await fetch(`${process.env.API.slice(0, -4)}/auth`, {
        method: "POST",
        body: JSON.stringify({
            email: user.email,
            password: hashHex
        })
    });
    // ログイン成功時
    if (response.status === 200) {
        const access_token = response.headers.get("Authorization");
        const refresh_token = response.headers.get("Refresh-Token");
        if (process.env.NODE_ENV === "development") {
            console.log('POST /api/auth\tLogin');
            console.log("access_token:");
            console.log(access_token);
            console.log("refresh_token:");
            console.log(refresh_token);
        }
        const user_id = accessToken(access_token).userid;
        if (process.env.NODE_ENV === "development") {
            console.log(`user_id: ${user_id}`);
        }
        // localStorageにユーザIDを保存
        localStorage.setItem("user_id", user_id);
        // localStorageにアクセストークンを保存
        localStorage.setItem("access_token", access_token);
        // cookieにリフレッシュトークンを保存（有効期限: 1ヶ月）
        component.$cookies.set("refresh_token", refresh_token, "1m");
        // ログインフォームを閉じる
        component.$emit("close");
        // ページをリロード
        if (component.$route.path !== "/") {
            component.$router.push('/');
        } else {
            component.$router.go('/');
        }
    } else {
        component.errorMessage = "ログインに失敗しました";
        component.invalid = true;
    }
}


// トークンの更新
async function refreshToken(component, access_token, refresh_token) {
    // トークン情報をサーバに送信し，レスポンスを得る
    const response = await fetch(`${process.env.API.slice(0, -4)}/auth/refresh_token`, {
        method: "GET",
        body: JSON.stringify({
            "Authorization": access_token,
            "Refresh-Token": refresh_token
        })
    });
    // 更新成功時
    if (response.status === 200) {
        const access_token = response.headers.get("Authorization");
        const refresh_token = response.headers.get("Refresh-Token");
        if (process.env.NODE_ENV === "development") {
            console.log('GET /api/refresh_token\tRefreshToken');
            console.log("access_token:");
            console.log(access_token);
            console.log("refresh_token:");
            console.log(refresh_token);
        }
        const user_id = accessToken(access_token).userid;
        // localStorageにユーザIDを保存
        localStorage.setItem("user_id", user_id);
        // localStorageにアクセストークンを保存
        localStorage.setItem("access_token", access_token);
        // cookieにリフレッシュトークンを保存（有効期限: 1ヶ月）
        component.$cookies.set("refresh_token", refresh_token, "1m");
        //リフレッシュトークンの有効期限が切れている場合
    } else if (response.status === 401) {
        // cookieからリフレッシュトークンを削除
        component.$cookies.remove("refresh_token");
        // ユーザにセッションの有効期限が切れたことを伝える
        window.alert("セッションの有効期限が切れました。再度ログインしてください");
        // ホームページに移動する
        if (component.$route.path !== "/") {
            component.$router.push('/');
        } else {
            component.$router.go('/');
        }
    }
}


// ユーザプロフィールの取得API
async function getProfile(component, user_id, access_token) {
    const response = await fetch(`${process.env.API}/user/${user_id}`, {
        method: 'GET',
        headers: {
            Authorization: access_token
        }
    });
    // 更新成功時
    if (response.status === 200) {
        const profile = await response.json();
        if (process.env.PATCH) {
            // 存在しないユーザの場合
            if (profile.user_id == 0) {
                // リフレッシュトークンを削除する
                component.$cookies.remove("refresh_token");
                // ホームページに移動する
                if (component.$route.path !== "/") {
                    component.$router.push('/');
                } else {
                    component.$router.go('/');
                }
            }
            profile.SNS = profile.sns;
            delete profile.sns;
            if (profile.SNS === null) {
                profile.SNS = [];
            }
            if (profile.SNS.github) {
                profile.SNS.Github = profile.SNS.github;
            } else {
                profile.SNS.Github = "";
            }
            delete profile.SNS.github;
            if (profile.SNS.twitter) {
                profile.SNS.Twitter = profile.SNS.twitter;
            } else {
                profile.SNS.Twitter = "";
            }
            delete profile.SNS.twitter;
            if (profile.SNS.facebook) {
                profile.SNS.Facebook = profile.SNS.facebook;
            } else {
                profile.SNS.Facebook = "";
            }
            delete profile.SNS.facebook;
        }
        for (let i = 0; i < profile.submissions.length; i++) {
            const request = await getRequest(profile.submissions[i].request_id);
            profile.submissions[i].request = request;
        }
        if (process.env.NODE_ENV === "development") {
            console.log(`GET /api/user/${user_id}\tUserProfile`);
            console.log(`Profile of ${profile.username}:`);
            console.log(profile);
        }
        return profile;
    }
}


// ユーザプロフィールの編集API
async function editProfile(component, user, access_token) {
    // パスワードのハッシュ化
    const hashHex = await hashPassword(user.password);
    const profile = user;
    profile.password = hashHex;
    if (process.env.PATCH) {
        profile.sns = profile.SNS;
        delete profile.SNS;
        profile.sns.github = profile.sns.Github;
        delete profile.sns.Github;
        profile.sns.twitter = profile.sns.Twitter;
        delete profile.sns.Twitter;
        profile.sns.facebook = profile.sns.Facebook;
        delete profile.sns.Facebook;
    }
    // プロフィール情報をサーバに送信し，レスポンスを得る
    const response = await fetch(`${process.env.API}/user/${profile.user_id}`, {
        method: "PUT",
        headers: {
            Authorization: access_token
        },
        body: JSON.stringify(profile)
    });
    // 登録成功時
    if (response.status === 201) {
        if (process.env.NODE_ENV === "development") {
            console.log(`PUT /api/user/${user.user_id}\tEditProfile`);
        }
        // 編集フォームを閉じる
        component.$emit("close");
        // ユーザ登録成功メッセージを表示する
        component.$emit("displayMessage");
        //アクセストークンの有効期限が切れている場合
    } else if (response.status === 401) {
        const refresh_token = component.$cookies.get("refresh_token");
        // リフレッシュトークンを更新する
        await refreshToken(component, access_token, refresh_token);
        // 再度ユーザプロフィールの編集をリクエストする
        await editProfile(component, user, access_token);
    }
}


// リクエスト一覧取得API
async function getRequests() {
    const response = await fetch(`${process.env.API}/requests`);
    let requests = await response.json();
    if (process.env.PATCH) {
        requests = requests.requests;
        delete requests.requests;
    }
    if (process.env.NODE_ENV === "development") {
        console.log('GET /api/requests\tAllRequests');
        console.log(requests);
    }
    return requests;
}


// 新規リクエスト投稿API
async function makeRequest(component, user_id, request, access_token) {
    const response = await fetch(`${process.env.API}/request`, {
        method: "POST",
        headers: {
            Authorization: access_token
        },
        body: JSON.stringify({
            requestname: request.title,
            client_id: user_id,
            content: request.detail
        })
    });
    // 登録成功時
    if (response.status === 200) {
        if (process.env.NODE_ENV === "development") {
            console.log('POST /api/request\tNewRequest');
        }
        // 新規リクエストフォームを閉じる
        component.$emit("close");
        // ユーザ登録成功メッセージを表示する
        component.$emit("displayMessage");
        //アクセストークンの有効期限が切れている場合
    } else if (response.status === 401) {
        const refresh_token = component.$cookies.get("refresh_token");
        // リフレッシュトークンを更新する
        await refreshToken(component, access_token, refresh_token);
        // 再度新規リクエストの投稿をリクエストする
        await makeRequest(component, user_id, request, access_token);
    }
}


// リクエスト取得API
async function getRequest(request_id) {
    const response = await fetch(`${process.env.API}/request/${request_id}`);
    let request = await response.json();
    if (process.env.PATCH) {
        request = request.request;
        delete request.request;
        if (request.engineers === null) {
            request.engineers = [];
        }
        if (request.submissions === null) {
            request.submissions = [];
        }
    }
    if (process.env.NODE_ENV === "development") {
        console.log(`GET /api/request/${request_id}\tShowRequest`);
        console.log(request);
    }
    return request;
}


// リクエスト編集API
async function editRequest(component, request, access_token) {
    // 提出物の情報をサーバに送信し，レスポンスを得る
    const response = await fetch(`${process.env.API}/request/${request.request_id}`, {
        method: "PUT",
        headers: {
            Authorization: access_token
        },
        body: JSON.stringify(request)
    });
    // 登録成功時
    if (response.status === 200) {
        if (process.env.NODE_ENV === "development") {
            console.log(`PUT /api/request/${request.request_id}\tEditRequest`);
        }
        // 編集フォームを閉じる
        component.$emit("close");
        // ユーザ登録成功メッセージを表示する
        component.$emit("displayMessage");
        //アクセストークンの有効期限が切れている場合
    } else if (response.status === 401) {
        const refresh_token = component.$cookies.get("refresh_token");
        // リフレッシュトークンを更新する
        await refreshToken(component, access_token, refresh_token);
        // 再度リクエストの編集をリクエストする
        await editRequest(component, request, access_token);
    }
}


// リクエスト参加API
async function joinRequest(component, request, access_token) {
    let patchedRequest = request;
    if (process.env.PATCH) {
        patchedRequest.request_id = String(patchedRequest.request_id);
        patchedRequest.engineer_id = String(patchedRequest.engineer_id);
    }
    // 提出物の情報をサーバに送信し，レスポンスを得る
    const response = await fetch(`${process.env.API}/request/${request.request_id}`, {
        method: "POST",
        headers: {
            Authorization: access_token
        },
        body: JSON.stringify(patchedRequest)
    });
    // 登録成功時
    if (response.status === 200) {
        if (process.env.NODE_ENV === "development") {
            console.log(`POST /api/request/${request.request_id}\tJoinRequest`);
        }
        // 編集フォームを閉じる
        component.$emit("close");
        // ユーザ登録成功メッセージを表示する
        component.$emit("displayMessage");
        //アクセストークンの有効期限が切れている場合
    } else if (response.status === 401) {
        const refresh_token = component.$cookies.get("refresh_token");
        // リフレッシュトークンを更新する
        await refreshToken(component, access_token, refresh_token);
        // 再度リクエストへの参加をリクエストする
        await joinRequest(component, request, access_token);
    }
}


// サブミッション提出API
async function submitSubmission(component, submission, access_token) {
    // 提出物の情報をサーバに送信し，レスポンスを得る
    const response = await fetch(`${process.env.API}/submission/${submission.request_id}`, {
        method: "POST",
        headers: {
            Authorization: access_token
        },
        body: JSON.stringify(submission)
    });
    // 登録成功時
    if (response.status === 200) {
        if (process.env.NODE_ENV === "development") {
            console.log(`POST /api/submission/${submission.request_id}\tNewSubmission`);
        }
        // 編集フォームを閉じる
        component.$emit("close");
        // ユーザ登録成功メッセージを表示する
        component.$emit("displayMessage");
        //アクセストークンの有効期限が切れている場合
    } else if (response.status === 401) {
        const refresh_token = component.$cookies.get("refresh_token");
        // リフレッシュトークンを更新する
        await refreshToken(component, access_token, refresh_token);
        // 再度ユーザプロフィールの編集をリクエストする
        await submitSubmission(component, submission, access_token);
    }
}


// サブミッション取得API
async function getsubmission(submission_id) {
    const response = await fetch(`${process.env.API}/submission/${submission_id}`);
    let submission = await response.json();
    if (process.env.PATCH) {
        submission = submission.submission;
        delete submission.submission;
    }
    if (process.env.NODE_ENV === "development") {
        console.log(`GET /api/submission/${submission_id}\tShwowSubmission`);
        console.log(`Submission #${submission.submission_id}:`);
        console.log(submission);
    }
    const request = await getRequest(submission.request_id);
    submission.request = request;
    return submission;
}


// サブミッション編集API
async function editSubmission(component, submission, access_token) {
    let patchedSubmission = submission;
    if (process.env.PATCH) {
        patchedSubmission.request_id = String(patchedSubmission.request_id);
        patchedSubmission.engineer_id = String(patchedSubmission.engineer_id);
    }
    // 提出物の情報をサーバに送信し，レスポンスを得る
    const response = await fetch(`${process.env.API}/submission/${submission.submission_id}`, {
        method: "PUT",
        headers: {
            Authorization: access_token
        },
        body: JSON.stringify(patchedSubmission)
    });
    // 登録成功時
    if (response.status === 200) {
        if (process.env.NODE_ENV === "development") {
            console.log(`PUT /api/submission/${submission.submission_id}\tEditSubmission`);
        }
        // 編集フォームを閉じる
        component.$emit("close");
        // ユーザ登録成功メッセージを表示する
        component.$emit("displayMessage");
        //アクセストークンの有効期限が切れている場合
    } else if (response.status === 401) {
        const refresh_token = component.$cookies.get("refresh_token");
        // リフレッシュトークンを更新する
        await refreshToken(component, access_token, refresh_token);
        // 再度サブミッションの編集をリクエストする
        await editSubmission(component, submission, access_token);
    }
}


// ディスカッション取得API
async function getComments(request_id) {
    const response = await fetch(`${process.env.API}/discussion/${request_id}`);
    let comments = (await response.json()).comments;
    if (process.env.PATCH) {
        if (comments === null) {
            comments = [];
        }
        comments.forEach(comment => {
            if (comment.reply_id === 0) {
                comment.reply_id = null;
            }
        });
    }
    if (process.env.NODE_ENV === "development") {
        console.log(`GET /api/discussion/${request_id}\tShowDiscussion`);
        console.log(comments);
    }
    return comments;
}


// コメント投稿API
async function addComment(component, comment, access_token) {
    if (process.env.PATCH) {
        comment.request_id = Number(comment.request_id);
        comment.user_id = Number(comment.user_id);
    }
    const response = await fetch(`${process.env.API}/discussion/${comment.request_id}`, {
        method: "POST",
        headers: {
            Authorization: access_token
        },
        body: JSON.stringify(comment)
    });
    // 登録成功時
    if (response.status === 201) {
        if (process.env.NODE_ENV === "development") {
            console.log(`POST /api/discussion/${comment.comment_id}\tNewComment`);
        }
        // コメント投稿成功メッセージを表示する
        component.isMessageModalActive = true;
        //アクセストークンの有効期限が切れている場合
    } else if (response.status === 401) {
        const refresh_token = component.$cookies.get("refresh_token");
        // リフレッシュトークンを更新する
        await refreshToken(component, access_token, refresh_token);
        // 再度コメントの投稿をリクエストする
        await makeRequest(component, comment, access_token);
    }
}


// 勝者決定API
async function chooseWinner(component, request, access_token) {
    let patchedRequest = request;
    if (process.env.PATCH) {
        patchedRequest.request_id = String(patchedRequest.request_id);
        patchedRequest.client_id = String(patchedRequest.client_id);
        patchedRequest.engineer_id = String(patchedRequest.engineer_id);
    }
    // 提出物の情報をサーバに送信し，レスポンスを得る
    const response = await fetch(`${process.env.API}/winner/${request.request_id}`, {
        method: "POST",
        headers: {
            Authorization: access_token
        },
        body: JSON.stringify(request)
    });
    // 登録成功時
    if (response.status === 200) {
        if (process.env.NODE_ENV === "development") {
            console.log(`POST /api/winner/${request.request_id}\tChooseWinner`);
        }
        // 編集フォームを閉じる
        component.$emit("close");
        // ユーザ登録成功メッセージを表示する
        component.$emit("displayMessage");
        //アクセストークンの有効期限が切れている場合
    } else if (response.status === 401) {
        const refresh_token = component.$cookies.get("refresh_token");
        // リフレッシュトークンを更新する
        await refreshToken(component, access_token, refresh_token);
        // 再度勝者の決定をリクエストする
        await makeRequest(component, request, access_token);
    }
}


export {
    register,
    login,
    refreshToken,
    getProfile,
    editProfile,
    getRequests,
    makeRequest,
    getRequest,
    editRequest,
    joinRequest,
    submitSubmission,
    getsubmission,
    editSubmission,
    getComments,
    addComment,
    chooseWinner
}