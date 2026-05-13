module Api
  module V1
    class EventsController < ApplicationController
      before_action :set_event, only: [ :show ]

      # GET /api/v1/events/:slug
      def show
        render json: @event.as_json(include: { time_options: {}, responses: { include: :votes } })
      end

      # POST /api/v1/events
      def create
        @event = Event.new(event_params)

        if @event.save
          render json: @event, include: [ "time_options" ], status: :created
        else
          render_validation_errors(@event)
        end
      end

      private
        def set_event
          @event = Event.find_by!(slug: params[:slug])
        end

        def event_params
          params.require(:event).permit(:name, :description, :time_zone, time_options_attributes: [ :starts_at ])
        end
    end
  end
end
