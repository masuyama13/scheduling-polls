class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  rescue_from ActionController::ParameterMissing, with: :render_bad_request

  private

    def render_validation_errors(record)
      render json: { errors: record.errors.full_messages }, status: :unprocessable_content
    end

    def render_not_found(_exception)
      render json: { errors: [ "Not found" ] }, status: :not_found
    end

    def render_bad_request(exception)
      render json: { errors: [ exception.message ] }, status: :bad_request
    end
end
