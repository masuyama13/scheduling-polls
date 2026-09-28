module Api
  module V1
    class EventsController < ApplicationController
      before_action :set_event, only: [ :show, :update, :destroy ]
      before_action :authorize_management, only: [ :update, :destroy ]

      # GET /api/v1/events/:public_token
      def show
        render json: event_json(include: { time_options: {}, responses: { include: :availabilities } })
      end

      # POST /api/v1/events
      def create
        @event = Event.new(event_params)

        if Event.transaction { @event.save }
          render json: event_json(include: [ "time_options" ]), status: :created
        else
          render_validation_errors(@event)
        end
      end

      # PATCH /api/v1/events/:public_token
      def update
        if @event.update(event_update_params)
          render json: event_json(include: [ "time_options" ])
        else
          render_validation_errors(@event)
        end
      end

      # DELETE /api/v1/events/:public_token
      def destroy
        @event.destroy!
        head :no_content
      end

      private
        def set_event
          @event = Event.find_by!(public_token: params[:public_token])
        end

        def event_params
          permitted = params.require(:event).permit(:name, :description, :time_zone, :password, :allow_passwordless_management, time_options_attributes: [ :starts_at ])
          permitted[:password] = nil if permitted[:password] == ""
          permitted
        end

        def event_update_params
          params.require(:event).permit(:name, :description)
        end

        def authorize_management
          return if @event.password_digest.blank? || @event.authenticate(params[:password])

          render json: { errors: [ "Password is incorrect." ] }, status: :forbidden
        end

        def event_json(**options)
          @event.as_json(**options, except: [ :password_digest ]).merge(password_protected: @event.password_digest.present?)
        end
    end
  end
end
