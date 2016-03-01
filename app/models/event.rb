# == Schema Information
#
# Table name: events
#
#  id             :integer          not null, primary key
#  caree_id       :integer
#  event          :string(36)       not null
#  heartrate      :float
#  latitude       :float
#  longitude      :float
#  altitude       :float
#  acceleration_x :float
#  acceleration_y :float
#  acceleration_z :float
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_events_on_event  (event)
#

class Event < ActiveRecord::Base
  belongs_to :caree

  scope :valid_location, -> { where.not(latitude: nil).where.not(longitude: nil) }

  class << self
    def to_google_map_polyline_format
      all.pluck(:latitude, :longitude).map { |lat, lng| { lat: lat, lng: lng } }
    end
  end
end
