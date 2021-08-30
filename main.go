package main

import (
  "net/http"
  "github.com/gin-gonic/gin"
  "flag"
  "os"
  // コメントを外す
  "optim_22_app/model"
  "optim_22_app/typefile"
  "optim_22_app/pkg/log"
  "optim_22_app/internal/config"

)

var flagConfig = flag.String("config", "./configs/app.yaml", "path to the config file")

func main() {
  flag.Parse()
  //zapロガーを設定ファイル`config/zap.yaml`を元に取得
  logger := log.New()
  logger.Debugf("start app")

  // load application configurations
  cfg, err := config.Load(*flagConfig, logger)
  if err != nil {
    logger.Errorf("failed to load application configuration: %s", err)
    os.Exit(-1)
  }


  logger.Debugf(cfg.DSN)


  

  // DB接続後、マイグレーションを実行する。
  // 手順としては、まずコンテナを立ち上げた後、mysqlでoptim_devデータベースを作成する。
  // その後、model.InitDB(),import(optim_22_app/model)のコメントを外し、カレントディレクトリでgo run main.goを実行する。
  // プログラムの詳細はmodel/migrate.goに記載。
  model.InitDB()

  // マイグレーションは定義したstructをAutoMigrateの引数に渡すことで、
  // それに対応するテーブルの作成を行う。
  // テーブル作成時にオプションを付けたい場合、db.Set()を利用する。
  model.Db.AutoMigrate(&typefile.User{},&typefile.Client{},&typefile.Engineer{},&typefile.Winner{},&typefile.Request{})

  // Insert
  // db.Create(&request)

  // Select
  // db.Find(&request, "id = ?", 10)

  // Batch Insert
  // var requests = []User{request1, request2, request3}
  // db.Create(&users)

  // ルーターを作成している
  router := gin.Default()
  // helloメソッドがwebブラウザから指定された場合、Hello World!!を返す。
  // gin.Contextはリクエストとレスポンスのやり取りをするための型である。
  // リクエストがokの場合、Hello World!!を返す。
  router.GET("/hello", func(c *gin.Context) {
    c.String(http.StatusOK, "Hello World!!")
  })
  // 8080ポートで実行。
  router.Run(":8080")
}
