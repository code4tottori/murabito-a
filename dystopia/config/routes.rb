Rails.application.routes.draw do
  resources :events
  resources :carees do
    member do
      get "locations"
    end
  end

  get '/', :to => redirect('/googlemap_marker.html')
  resources :mqtturis, only:[:index], path:'mqtturi'
  # root to: 'welcome#index'
end
