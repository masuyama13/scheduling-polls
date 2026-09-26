require "rails_helper"

RSpec.describe "Api::V1::Events", type: :request do
  describe "GET /api/v1/events/:public_token" do
    context "when the event exists" do
      let(:event) { create(:event) }
      let!(:time_option1) { event.time_options.first }
      let!(:time_option2) { create(:time_option, event: event, starts_at: Time.current + 14.days) }


      it "returns the event with time options" do
        get api_v1_event_path(event.public_token)
        expect(response).to have_http_status(200)
        json_response = JSON.parse(response.body)
        expect(json_response["id"]).to eq(event.id)
        expect(json_response["time_options"].length).to eq(2)
        expect(json_response["responses"]).to eq([])
      end

      context "when the event has responses" do
        let(:response1) { create(:response, event: event) }

        before do
          create(:availability, response: response1, time_option: time_option1, status: :available)
          create(:availability, response: response1, time_option: time_option2, status: :unavailable)
        end

        it "returns the event with responses and availabilities" do
          get api_v1_event_path(event.public_token)
          expect(response).to have_http_status(200)
          json_response = JSON.parse(response.body)
          expect(json_response["responses"].length).to eq(1)
          expect(json_response["responses"][0]["availabilities"].length).to eq(2)
          expect(json_response["responses"][0]["availabilities"][0]["status"]).to eq("available")
        end
      end
    end

    context "when the event does not exist" do
      it "returns not found" do
        get api_v1_event_path(public_token: "missing_event_token")
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "POST /api/v1/events" do
    context "when the request is valid" do
      let(:params) do
        {
          name: "New Event",
          description: "This is a new event.",
          time_zone: "America/Vancouver",
          time_options_attributes: [
            { starts_at: Time.current + 7.days },
            { starts_at: Time.current + 14.days }
          ]
        }
      end

      it "returns the created event with time options" do
        post api_v1_events_path, params: { event: params }
        expect(response).to have_http_status(:created)
        json_response = JSON.parse(response.body)
        expect(json_response["name"]).to eq("New Event")
        expect(json_response["time_options"].length).to eq(2)
        expect(json_response["public_token"]).to match(/\A[A-Za-z0-9_-]{43}\z/)
      end
    end

    context "when the event violates creation limits" do
      it "rejects an event without time options" do
        post api_v1_events_path, params: { event: { name: "New Event", time_zone: "America/Vancouver" } }

        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)["errors"]).to include("Time options must contain between 1 and 10 options")
      end

      it "rejects an event with more than ten time options" do
        time_options = 11.times.map { |index| { starts_at: (index + 1).days.from_now } }

        post api_v1_events_path, params: {
          event: { name: "New Event", time_zone: "America/Vancouver", time_options_attributes: time_options }
        }

        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)["errors"]).to include("Time options must contain between 1 and 10 options")
      end

      it "rejects an event with duplicate time options" do
        starts_at = 1.day.from_now

        post api_v1_events_path, params: {
          event: {
            name: "New Event",
            time_zone: "America/Vancouver",
            time_options_attributes: [ { starts_at: starts_at }, { starts_at: starts_at } ]
          }
        }

        expect(response).to have_http_status(:unprocessable_content)
      end

      it "rejects an event with an invalid time zone" do
        post api_v1_events_path, params: {
          event: {
            name: "New Event",
            time_zone: "Invalid/Timezone",
            time_options_attributes: [ { starts_at: 1.day.from_now } ]
          }
        }

        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)["errors"]).to include("Time zone is invalid")
      end

      it "rejects an event with an overly long name or description" do
        post api_v1_events_path, params: {
          event: {
            name: "a" * 101,
            description: "a" * 401,
            time_zone: "America/Vancouver",
            time_options_attributes: [ { starts_at: 1.day.from_now } ]
          }
        }

        expect(response).to have_http_status(:unprocessable_content)
        errors = JSON.parse(response.body)["errors"]
        expect(errors).to include("Name is too long (maximum is 100 characters)")
        expect(errors).to include("Description is too long (maximum is 400 characters)")
      end
    end

    context "when the event parameter is missing" do
      let(:params) do
        {
          name: "New Event",
          description: "This is a new event.",
          time_zone: "America/Vancouver"
        }
      end

      it "returns bad request" do
        post api_v1_events_path, params: params

        expect(response).to have_http_status(:bad_request)
      end
    end
  end
end
