class Caree < ActiveRecord::Base
  has_many :event

  def last_event
    @last_event ||= Event.where(caree_id:id).last
  end
end
