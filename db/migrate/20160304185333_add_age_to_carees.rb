class AddAgeToCarees < ActiveRecord::Migration
  def change
    add_column :carees, :age, :integer, after: :name
  end
end
