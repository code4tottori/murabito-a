Rails.application.routes.draw do
  resources :events
  resources :carees

  get '/', :to => redirect('/googlemap_marker.html')
  resources :mqtturis, only:[:index], path:'mqtturi'
  # root to: 'welcome#index'
end
