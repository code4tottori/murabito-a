class CreateCarees < ActiveRecord::Migration
  def change
    create_table :carees do |t|
      t.string :name, limit: 192, null: false
      t.string :icon, null: true

      t.timestamps null: false
    end
    add_index :carees, :name
  end
end
