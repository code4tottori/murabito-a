Rails.application.routes.draw do
  get 'welcome/index'

  resources :events
  resources :carees

  # get '/', :to => redirect('/googlemap_marker.html')
  resources :mqtturis, only:[:index], path:'mqtturi'
  root to: 'welcome#index'
end
