package main

import (
  "net/http"
  "github.com/gin-gonic/gin"
  // コメントを外す
  "optim_22_app/model"
  "optim_22_app/typefile"
  "optim_22_app/pkg/log"
)

func main() {
  //zapロガーを設定ファイル`configs/zap.yaml`を元に取得
  logger := log.New()
  logger.Debugf("start app")

  // DB接続後、マイグレーションを実行する。
  // 手順としては、まずコンテナを立ち上げた後、mysqlでoptim_devデータベースを作成する。
  // その後、model.InitDB(),import(optim_22_app/model)のコメントを外し、カレントディレクトリでgo run main.goを実行する。
  // プログラムの詳細はmodel/migrate.goに記載。
  model.InitDB()

  // マイグレーションは定義したstructをAutoMigrateの引数に渡すことで、
  // それに対応するテーブルの作成を行う。
  // テーブル作成時にオプションを付けたい場合、db.Set()を利用する。
  model.Db.AutoMigrate(&typefile.User{},&typefile.Client{},&typefile.Engineer{},&typefile.Winner{},&typefile.Request{})

  // テスト実行前に利用するデータを作成する
  model.CreateTestData()

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
