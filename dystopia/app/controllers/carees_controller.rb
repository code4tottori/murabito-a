class CareesController < ApplicationController
  before_action :set_caree, only: [:show, :edit, :update, :destroy]

  # GET /carees
  # GET /carees.json
  def index
    @carees = Caree.all
  end

  # GET /carees/1
  # GET /carees/1.json
  def show
  end

  # GET /carees/new
  def new
    @caree = Caree.new
  end

  # GET /carees/1/edit
  def edit
  end

  # POST /carees
  # POST /carees.json
  def create
    @caree = Caree.new(caree_params)

    respond_to do |format|
      if @caree.save
        format.html { redirect_to @caree, notice: 'Caree was successfully created.' }
        format.json { render :show, status: :created, location: @caree }
      else
        format.html { render :new }
        format.json { render json: @caree.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /carees/1
  # PATCH/PUT /carees/1.json
  def update
    respond_to do |format|
      if @caree.update(caree_params)
        format.html { redirect_to @caree, notice: 'Caree was successfully updated.' }
        format.json { render :show, status: :ok, location: @caree }
      else
        format.html { render :edit }
        format.json { render json: @caree.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /carees/1
  # DELETE /carees/1.json
  def destroy
    @caree.destroy
    respond_to do |format|
      format.html { redirect_to carees_url, notice: 'Caree was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_caree
      @caree = Caree.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def caree_params
      params.fetch(:caree, {}).permit(:name, :icon)
    end
end
