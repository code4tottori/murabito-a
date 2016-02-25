require 'test_helper'

class CareesControllerTest < ActionController::TestCase
  setup do
    @caree = carees(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:carees)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create caree" do
    assert_difference('Caree.count') do
      post :create, caree: {  }
    end

    assert_redirected_to caree_path(assigns(:caree))
  end

  test "should show caree" do
    get :show, id: @caree
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @caree
    assert_response :success
  end

  test "should update caree" do
    patch :update, id: @caree, caree: {  }
    assert_redirected_to caree_path(assigns(:caree))
  end

  test "should destroy caree" do
    assert_difference('Caree.count', -1) do
      delete :destroy, id: @caree
    end

    assert_redirected_to carees_path
  end
end
