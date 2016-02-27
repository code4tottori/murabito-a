source 'https://rubygems.org'

ruby '2.3.0'

gem 'rails', '4.2.5.1'

# database
group :development, :test do
  gem 'sqlite3'
end
group :production do
  gem 'pg'
end

# app server
gem 'thin'

gem 'sass-rails', '~> 5.0'
gem 'uglifier', '>= 1.3.0'
gem 'coffee-rails', '~> 4.1.0'
gem 'bootswatch-rails'

gem 'jquery-rails'
gem 'jquery-ui-sass-rails'

gem 'bootstrap-sass'
gem 'bootstrap-sass-extras'
gem 'compass'
gem 'compass-rails'
gem 'font-awesome-rails'

gem 'rack-utf8_sanitizer'

gem 'jbuilder', '~> 2.0'
gem 'grape'
gem 'aws-sdk'
gem 'mqtt'
gem 'rest-client'
gem 'foreman'

group :development, :test do
  gem 'byebug'
end

group :development, :test do
  gem 'pry-rails'
  gem 'pry-doc', require: false
  gem 'pry-coolline'
  gem 'pry-byebug', platforms: [:mri]
  gem 'hirb'
  gem 'hirb-unicode'
  gem 'awesome_print'
end

group :development do
  gem 'bullet'
  gem 'annotate'
  gem 'quiet_assets'

  gem 'meta_request'
  gem 'rack-mini-profiler'

  gem 'spring'
  gem 'guard'
  gem 'guard-bundler'
  gem 'guard-minitest'

  group :darwin do
    gem 'terminal-notifier-guard'
  end
end

group :test do
  gem 'minitest'
  gem 'minitest-rails'
  gem 'minitest-rails-capybara'
  gem 'minitest-power_assert'
  gem 'minitest-bang'
  gem 'minitest-stub_any_instance'
end

group :production do
  gem 'rails_12factor'
end

