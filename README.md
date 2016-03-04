Dystopia
========

# for development

## foreman

`.foreman` (gitignored) を作成

    procfile: Procfile.development

# heroku で動かす手順

以下、で実行されている `heroku` コマンドは必要に応じて `--app` オプションを付けて下さい。

## 前準備

* murabito-a を github リポジトリからクローンできてる?
* heroku のクライアントツールは導入しているか? ( `gem install heroku` とか )

## 手順

1. heroku でアプリケーションを作成する
2. 作成した heroku アプリケーションに環境変数を設定 (設定内容後述)
3. 上記ののち、

```
git clone {murabito-a の github リポジトリ}
cd murabito-a/
heroku git:remote -a {herokuでのアプリケーション名}
git push heroku master
```

### heroku アプリケーションに設定する環境変数

| 名称                      | 値                                  |
|---------------------------|-------------------------------------|
| LANG                      | ja_JP.UTF-8                         |
| TZ                        | Asia/Tokyo                          |
| RACK_ENV                  | production                          |
| RAILS_ENV                 | production                          |
| RAILS_SERVE_STATIC_FILES  | enabled                             |
| SECRET_KEY_BASE           | (rake secret コマンドの出力結果等)  |
| BUNDLE_WITHOUT            | development:test                    |

上記は Rails on Heroku での一般的な設定な構成(微妙に方言あるけど)であり、
アプリケーション独自の設定として以下があります。

| 名称                  | 値                   |
|-----------------------|----------------------|
| SQS_URI               | `TODO: fixme`        |
| AWS_REGION            | `TODO: fixme`        |
| AWS_ACCESS_KEY_ID     | `TODO: fixme`        |
| AWS_SECRET_ACCESS_KEY | `TODO: fixme`        |

## worker を動かす必要ががが

```
$ heroku ps:scale           # 確認
console=0:Free rake=0:Free web=1:Free worker=0:Free
$ heroku ps:scale worker=1  # worker プロセスを動かす
$ heroku ps:scale           # 確認
console=0:Free rake=0:Free web=1:Free worker=1:Free
```

## FAQ

* デプロイしたけど、アクセスすると動かない
  * > DB マイグレートしましたか? ( `heroku run rake db:migrate` )
* ログ見たい
  * > `heroku logs` とか `heroku logs -t` とか
* なんだかCSS効いてない?
  * > RAILS_SERVE_STATIC_FILES の値を確認してください
* コンソール操作したい
  * > `heroku run rails console`

## 関連サイトまとめ

* `/public/samples/` の画像
  * [イラストAC](http://www.ac-illust.com/)

