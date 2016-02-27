# ルーティング構成を変更した場合は
# bundle exec rake js:routes
# を実行して app/assets/javascripts/routes.js を更新してください。
#
Rails.application.routes.draw do

  resources :events
  resources :carees do
    member do
      get "locations"
    end
  end

  resources :mqtturis, only:[:index], path:'mqtturi'
  root to: 'welcome#index'
end
