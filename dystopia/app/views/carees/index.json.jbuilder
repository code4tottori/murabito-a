json.array!(@carees) do |caree|
  json.extract! caree, :id
  json.url caree_url(caree, format: :json)
end
