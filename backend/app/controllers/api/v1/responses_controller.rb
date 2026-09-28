module Api
  module V1
    class ResponsesController < ApplicationController
      before_action :set_event
      before_action :set_response, only: %i[update destroy]

      # POST /api/v1/events/:event_public_token/responses
      def create
        response = nil

        @event.with_lock do
          response = @event.responses.new(response_params)
          response.save
        end

        if response.persisted?
          render json: response, include: [ "availabilities" ], status: :created
        else
          render_validation_errors(response)
        end
      end

      # PATCH /api/v1/events/:event_public_token/responses/:id
      def update
        if @response.update(response_params)
          render json: @response, include: [ "availabilities" ]
        else
          render_validation_errors(@response)
        end
      end

      # DELETE /api/v1/events/:event_public_token/responses/:id
      def destroy
        @response.destroy!
        head :no_content
      end

      private
        def set_event
          @event = Event.find_by!(public_token: params[:event_public_token])
        end

        def set_response
          @response = @event.responses.find(params[:id])
        end

        def response_params
          params.require(:response).permit(:name, :comment, :time_zone, :city_key, availabilities_attributes: [ :id, :time_option_id, :status ])
        end
    end
  end
end
