# optim_22_app

## ディレクトリ構成

```
.
├──config               #各種設定ファイル（例：app.yaml, zap.yaml）。
├──controller               
│  ├──request
│  ├──top
│  ├──user     
│  │   └──api               #APIエンドポイントハンドラ。リクエストの正常性確認後serviceに渡す。
│  └── ...             
├──model
│  ├──user
│  │   ├──repository        #DBとの通信処理。ORMを⽤いたスクリプトなど。
│  │   └──service           #リクエストの内容がAPIの仕様に則しているか、repoを⽤いた⼀連の処理。
│  └── ...
├──mysql
├──pkg
│  ├──config
│  └──log
├──test
├──typefile
├──view
│   └──top
└── ...
```

