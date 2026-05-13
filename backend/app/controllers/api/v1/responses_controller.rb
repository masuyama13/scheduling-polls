module Api
  module V1
    class ResponsesController < ApplicationController
      before_action :set_event

      # POST /api/v1/events/:event_slug/responses
      def create
        response = @event.responses.new(response_params)

        if response.save
          render json: response, include: [ "votes" ], status: :created
        else
          render_validation_errors(response)
        end
      end

      private
        def set_event
          @event = Event.find_by!(slug: params[:event_slug])
        end

        def response_params
          params.require(:response).permit(:name, :comment, :time_zone, votes_attributes: [ :time_option_id, :available ])
        end
    end
  end
end
