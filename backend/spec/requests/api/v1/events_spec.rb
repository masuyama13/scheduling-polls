require "rails_helper"

RSpec.describe "Api::V1::Events", type: :request do
  describe "GET /api/v1/events/:id" do
    context "when the event exists" do
      let(:event) { create(:event) }

      before do
        create(:time_option, event: event, starts_at: Time.current + 7.days)
        create(:time_option, event: event, starts_at: Time.current + 14.days)
      end

      it "returns the event with time options" do
        get api_v1_event_path(event)
        expect(response).to have_http_status(200)
        json_response = JSON.parse(response.body)
        expect(json_response["id"]).to eq(event.id)
        expect(json_response["time_options"].length).to eq(2)
      end
    end

    context "when the event does not exist" do
      it "returns not found" do
        missing_event_id = Event.maximum(:id).to_i + 1_000

        get api_v1_event_path(id: missing_event_id)
        expect(response).to have_http_status(404)
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
      end
    end
  end
end
