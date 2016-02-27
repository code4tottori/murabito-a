# == Schema Information
#
# Table name: carees
#
#  id         :integer          not null, primary key
#  name       :string(192)      not null
#  icon       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_carees_on_name  (name)
#

class Caree < ActiveRecord::Base
  has_many :event

  def last_event
    @last_event ||= Event.where(caree_id:id).last
  end
end