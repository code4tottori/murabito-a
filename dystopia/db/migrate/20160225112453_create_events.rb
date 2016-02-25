class CreateEvents < ActiveRecord::Migration
  def change
    create_table :events do |t|
      t.belongs_to  :caree
      t.string :event, limit: 36, null: false
      t.float :heartrate, null: true
      t.float :latitude, null: true
      t.float :longitude, null: true
      t.float :altitude, null: true
      t.float :acceleration_x, null: true
      t.float :acceleration_y, null: true
      t.float :acceleration_z, null: true

      t.timestamps null: false
    end
    add_index :events, :event
  end
end
