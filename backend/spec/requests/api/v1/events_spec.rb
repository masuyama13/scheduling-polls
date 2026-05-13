require "rails_helper"

RSpec.describe "Api::V1::Events", type: :request do
  describe "GET /api/v1/events/:slug" do
    context "when the event exists" do
      let(:event) { create(:event) }
      let!(:time_option1) { create(:time_option, event: event, starts_at: Time.current + 7.days) }
      let!(:time_option2) { create(:time_option, event: event, starts_at: Time.current + 14.days) }


      it "returns the event with time options" do
        get api_v1_event_path(event.slug)
        expect(response).to have_http_status(200)
        json_response = JSON.parse(response.body)
        expect(json_response["id"]).to eq(event.id)
        expect(json_response["time_options"].length).to eq(2)
        expect(json_response["responses"]).to eq([])
      end

      context "when the event has responses" do
        let(:response1) { create(:response, event: event) }

        before do
          create(:vote, response: response1, time_option: time_option1, available: true)
          create(:vote, response: response1, time_option: time_option2, available: false)
        end

        it "returns the event with responses and votes" do
          get api_v1_event_path(event.slug)
          expect(response).to have_http_status(200)
          json_response = JSON.parse(response.body)
          expect(json_response["responses"].length).to eq(1)
          expect(json_response["responses"][0]["votes"].length).to eq(2)
          expect(json_response["responses"][0]["votes"][0]["available"]).to eq(true)
        end
      end
    end

    context "when the event does not exist" do
      it "returns not found" do
        get api_v1_event_path(slug: "missing_event_slug")
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
