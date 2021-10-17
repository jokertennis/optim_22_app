# optim_22_app

## システム構成図

![システム構成図](https://raw.githubusercontent.com/optim22team/optim_22_app/add-architecture-diagram/architecture_diagram.svg  "システム構成図")


## 環境構築手順

step1 optim-22-appのリポジトリをcloneする。  
```
git clone https://github.com/optim22team/optim_22_app.git
```
step2 .env,.gitignoreファイルを生成する。  
```
touch .env .gitignore
```
step3 docker-imageを作成する。  
```
docker-compose build
```
step4 docker-containerを作成する。  
```
docker-compose up -d
```
step5 go_container,mysql_containerが立ち上がっていることを確認する。  
```
docker ps
```
step6 データが出力されていることを確認する。確認した場合は、step14まで飛ぶ。(curl: (52) Empty reply from serverエラー,あるいは{"requests":null}が出力された場合、step7以降の作業が必要となる。)  
```
curl http://localhost:8080/api/requests
```
step7 mysql_containerに入る。  
```
docker exec -it mysql_container_ID bash
```
step8 mysqlのログインをする。  
```
mysql -u root -p
```
step9 mysqlのパスワードを入力する。(ERROR 2002 (HY000): Can't connect to local MySQL server through socket '/var/run/mysqld
/mysqld.sock'),あるいは (ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: YES))というエラーが生じた場合、必要なファイルが生成されるまで待つ。  
```
rootpass
```
step10 mysqlへのログインが成功したら、mysqlをログアウトする。  
```
exit
```
step11 mysql-containerをログアウトする。  
```
exit
```
step12 go_containerに入る。  
```
docker exec -it go_container_ID bash
```
step13 カレントディレクトリで以下のコマンドを実行する。  
```
go run main.go
```
step14 ブラウザで[http://localhost:8081](http://localhost:8081)にアクセスする。  


## ディレクトリ構成

```
.
├─configs
├─internal
│  ├─app
│  │  ├─client
│  │  ├─comment
│  │  ├─engineer
│  │  ├─home
│  │  ├─profile
│  │  │  └─repository
│  │  ├─request
│  │  ├─submission
│  │  └─user
│  └─pkg
│      ├─auth22
│      │  └─test
│      ├─config
│      ├─test
│      │  └─v2
│      └─utils
├─model
├─mysql
├─pkg
│  └─log
│      └─test
├─typefile
└─view
    ├─build
    ├─config
    ├─src
    │  ├─assets
    │  ├─components
    │  ├─modules
    │  └─router
    ├─static
    └─test
        ├─e2e
        │  ├─custom-assertions
        │  └─specs
        └─unit
            └─specs
```
