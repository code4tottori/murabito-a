# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

unless Caree.exists?
  Caree.create([
    { name: '木村拓哉', age: 44, icon: '/samples/1.png' },
    { name: '稲垣吾郎', age: 43, icon: '/samples/2.png' },
    { name: '草彅剛'  , age: 42, icon: '/samples/3.png' },
    { name: '香取慎吾', age: 39, icon: '/samples/4.png' },
    { name: '中居正広', age: 43, icon: '/samples/5.png' },
  ])
end

