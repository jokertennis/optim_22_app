package profile

import (
//  "regexp"
  "github.com/go-ozzo/ozzo-validation/v4"
  "github.com/go-ozzo/ozzo-validation/v4/is"
  "optim_22_app/pkg/log"
  "optim_22_app/typefile"
  "encoding/json"
  "strconv"
  "context"
  "errors"
//  "optim_22_app/internal/app/profile/repository"
)


type sns struct {
  Github         string          `json:"github"`
  Twitter         string          `json:"twitter"`
  Facebook        string          `json:"facebook"`
}


type profile struct {
  Id         int             `json:"user_id"`
  Email      string          `json:"email"`
  Name       string          `json:"username"`
  Bio        string          `json:"comment"`
  Sns        json.RawMessage `json:"sns"`
  Icon       string          `json:"icon"`
  Submission json.RawMessage `json:"submissions"`
  Request    json.RawMessage `json:"requests"`
}

/*
func (m sns) Validate() error {
  return validation.ValidateStruct(&m,
    validation.Field(&m.Github, is.URL, validation.Match(regexp.MustCompile("https://github\\.com/.*"))),
    validation.Field(&m.Twitter, is.URL, validation.Match(regexp.MustCompile("https://twitter\\.com/.*"))),
    validation.Field(&m.Facebook, is.URL, validation.Match(regexp.MustCompile("https://.*\\.facebook\\.com/.*"))),
  )
}
*/

func (m profile) Validate() error {
  return validation.ValidateStruct(&m,
    //is unsigned integer
    //validation.Field(&m.Id, validation.Match(regexp.MustCompile("\\d+"))),
    //is BIO
    validation.Field(&m.Bio, validation.Length(0, 4000)),
    //is BASE64 encoded image, limited to 2MB ([MB] 2 * 1.33 ~ 2.67) 
    validation.Field(&m.Icon, validation.Length(0, 2.67e+6), is.Base64),
  )
}


type Service interface {
  Get(ctx context.Context, req string) (profile, error)
  Post(ctx context.Context, req profile) error
  Patch(ctx context.Context, req profile) error
  Delete(ctx context.Context, req string) error
}


type service struct {
  repo   Repository
  logger log.Logger
}

//新たなプロフィール操作サービスを作成
func NewService(repo Repository, logger log.Logger) Service {
  return service{repo, logger}
}


func (s service) Get(ctx context.Context, req string) (profile, error) {
  //リクエスト文字列を数値型ユーザIDに変換
  //var userId int
  userId, err := strconv.Atoi(req)
  if err != nil {
    return profile{}, err
  }
  //該当ユーザのプロフィールを取得
  //var userProfileWithRecords profile

  if userProfile, err := s.repo.Get(ctx, userId); err != nil {
    return profile{}, err
  } else {
    if requesteds, err := s.repo.GetRequested(ctx, userId); err != nil {
      return profile{}, err
    } else {
      if requestedsText, err := json.Marshal(requesteds); err != nil {
        return profile{}, err
      } else {
        if participateds, err := s.repo.GetParticipated(ctx, userId); err != nil {
          return profile{}, err
        } else {
          if participatedsText, err := json.Marshal(participateds); err != nil {
            return profile{}, err
          } else {
            //#region as userProfileWithRecords
            userProfile.Submission = participatedsText
            userProfile.Request = requestedsText
            //#endregion
            return userProfile, nil
          }
        }
      }
    }
  }
}


func (s service) Post(ctx context.Context, req profile) error {
  //SNS登録情報を読み込み
  sns := sns{}
  json.Unmarshal(req.Sns, &sns)
  //リクエストの値を検証
  if err := req.Validate(); err != nil {
    return err
  }
  //クエリの値を定義
  insertValues := typefile.Profile{
    ID:      req.Id,
    Bio:     req.Bio,
    Sns:     req.Sns,
    Icon:    req.Icon,
  }
  //INSERT
  if err := s.repo.Create(ctx, &insertValues); err != nil {
    return err
  } else {
    return nil
  }
}


func (s service) Patch(ctx context.Context, req profile) error {
  //SNS登録情報を読み込み
  snsUrl := sns{}
  json.Unmarshal(req.Sns, &snsUrl)
  //リクエストの値を検証
  if err := req.Validate(); err != nil {
    return err
  }
  //クエリの値を定義
  insertValues := typefile.Profile{
    ID:      req.Id,
    Bio:     req.Bio,
    Sns:     req.Sns,
    Icon:    req.Icon,
  }
  //UPDATE
  if err := s.repo.Update(ctx, &insertValues); err != nil {
    return err
  } else {
    return nil
  }
}


func (s service) Delete(ctx context.Context, req string) error {
  //リクエスト文字列を数値型ユーザIDに変換
  //var userId int
  userId, err := strconv.Atoi(req)
  if err != nil {
    return err
  }
  //該当ユーザのプロフィールを削除
  if err := s.repo.Delete(ctx, userId); err != nil {
    return err
  } else {
    return nil
  }
}



//#region スタブ
type ServiceStub interface {
  Get(ctx context.Context, req string) (profile, error)
  Post(ctx context.Context, req profile) error
  Patch(ctx context.Context, req profile) error
  Delete(ctx context.Context, req string) error
}


type serviceStub struct {
  repo   Repository
  logger log.Logger
}


func (s serviceStub) Get(ctx context.Context, req string) (profile, error) {
  if "" == req {
    return profile{}, errors.New("不明なユーザのプロフィールを参照しました。")
  }
  dummyProfile := profile{
    Bio: "test", 
    Sns: []byte(`{"twitter": "twitter.com/pole", "facebook": "facebook.com/pole"}`), 
    Submission: []byte(`{}`), 
    Request: []byte(`{}`), 
    Icon: "test",
  }
  return dummyProfile, nil
}


func (s serviceStub) Post(ctx context.Context, req profile) error {
  return nil
}


func (s serviceStub) Patch(ctx context.Context, req profile) error {
  return nil
}


func (s serviceStub) Delete(ctx context.Context, req string) error {
  return nil
}


func NewServiceStub(args ...interface{}) ServiceStub { 
  return serviceStub{nil, nil}
}

//#endregion