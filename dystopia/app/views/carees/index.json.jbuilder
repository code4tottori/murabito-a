json.array!(@carees) do |caree|
  json.extract! caree, :id
  json.extract! caree, :name
  json.extract! caree, :icon
  json.extract! caree, :last_event
  json.extract! caree, :created_at
  json.extract! caree, :updated_at
end
