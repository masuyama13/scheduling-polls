module Api
  module V1
    class ResponsesController < ApplicationController
      before_action :set_event

      # POST /api/v1/events/:event_public_token/responses
      def create
        response = @event.responses.new(response_params)

        if response.save
          render json: response, include: [ "availabilities" ], status: :created
        else
          render_validation_errors(response)
        end
      end

      private
        def set_event
          @event = Event.find_by!(public_token: params[:event_public_token])
        end

        def response_params
          params.require(:response).permit(:name, :comment, :time_zone, availabilities_attributes: [ :time_option_id, :status ])
        end
    end
  end
end
