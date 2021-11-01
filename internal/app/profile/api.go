package profile

import (
  "github.com/gin-gonic/gin"
  "net/http"
  "encoding/json"
  "optim_22_app/pkg/log"
  //"optim_22_app/internal/app/user"
 // "optim_22_app/internal/pkg/utils"

)

//プロフィール操作の依存関係
type resource struct {
  service Service
  logger  log.Logger
}

//プロフィール操作についてエンドポイントを登録
func RegisterHandlers(r *gin.RouterGroup, service Service, logger log.Logger) {
  rc := resource{service, logger}
  //取得
  r.GET("/:userID", rc.get())
  //修正
  r.PUT("/:userID", rc.put())
}


func (rc resource) get() gin.HandlerFunc {
  return func(c *gin.Context) {
    userId := c.Param("userID")
    userProfile, err := rc.service.Get(c.Request.Context(), userId)
    if err != nil {
      rc.logger.Error(err)
      c.Status(http.StatusNotFound)
      return 
    } else {
      if userProfileText, err := json.Marshal(userProfile); err != nil {
        rc.logger.Error(err)
        c.Status(http.StatusBadRequest)
        return
      } else {
        c.Header("Content-Type", "application/json")
        c.String(http.StatusOK, string(userProfileText[:]))
        return
      }
    }
  }
}


func (rc resource) put() gin.HandlerFunc {
  return func(c *gin.Context) {
    var profileUpdates profile
    var credeentialUpdates RegistrationInformation

    /*
     * c.ShouldBindJSONの実行によりRequest.Bodyストリームを消費してしまうため
     * bodyバッファに出力後encoding/jsonパッケージにて読み出し処理
     *
     */

    //Request.Bodyストリームをbodyバッファに出力する
    body, err := c.GetRawData(); 
    if err != nil {
      rc.logger.Error(err)
      c.Status(http.StatusBadRequest)
      return
    } 
    //変更されたプロフィールをパースして読み取る
    if err := json.Unmarshal(body, &profileUpdates); err != nil {
      rc.logger.Error(err)
      c.Status(http.StatusBadRequest)
      return
    }
    //変更された資格情報をパースして読み取る
    if err := json.Unmarshal(body, &credeentialUpdates); err != nil {
      rc.logger.Error(err)
      c.Status(http.StatusBadRequest)
      return
    }    
    //プロフィールと資格情報を編集
    err = rc.service.Put(c.Request.Context(), profileUpdates, credeentialUpdates)
    if err != nil {
      rc.logger.Error(err)
      c.Status(http.StatusBadRequest)
      return 
    } else {
      c.Status(http.StatusCreated)
      return 
    }
  }
}
