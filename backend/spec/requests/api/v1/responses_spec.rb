require "rails_helper"

RSpec.describe "Api::V1::Responses", type: :request do
  describe "POST /api/v1/events/:event_id/responses" do
    let(:event) { create(:event) }
    let(:time_option1) { create(:time_option, event: event, starts_at: Time.current + 7.days) }
    let(:time_option2) { create(:time_option, event: event, starts_at: Time.current + 14.days) }

    context "when the request is valid" do
      let(:params) do
        {
          name: "John",
          comment: "Looking forward to this event!",
          time_zone: "America/Vancouver",
          votes_attributes: [
            { time_option_id: time_option1.id, available: true },
            { time_option_id: time_option2.id, available: false }
          ]
        }
      end

      it "creates a response with votes" do
        expect do
          post api_v1_event_responses_path(event), params: { response: params }
        end.to change(Response, :count).by(1)
         .and change(Vote, :count).by(2)

        expect(response).to have_http_status(:created)
        json_response = JSON.parse(response.body)
        expect(json_response["name"]).to eq("John")
        expect(json_response["votes"].length).to eq(2)
      end
    end

    context "when the event does not exist" do
      let(:params) do
        {
          name: "John",
          comment: "Looking forward to this event!",
          time_zone: "America/Vancouver",
          votes_attributes: [
            { time_option_id: time_option1.id, available: true },
            { time_option_id: time_option2.id, available: false }
          ]
        }
      end

      it "returns not found and does not save the data" do
        missing_event_id = Event.maximum(:id).to_i + 1_000

        expect do
          post api_v1_event_responses_path(event_id: missing_event_id), params: { response: params }
        end.to change(Response, :count).by(0)
         .and change(Vote, :count).by(0)

        expect(response).to have_http_status(:not_found)
      end
    end

    context "when votes belong to another event" do
      let(:other_event_time_option) { create(:time_option, event: create(:event), starts_at: Time.current + 8.days) }
      let(:params) do
        {
          name: "John",
          comment: "Looking forward to this event!",
          time_zone: "America/Vancouver",
          votes_attributes: [
            { time_option_id: time_option1.id, available: true },
            { time_option_id: other_event_time_option.id, available: false }
          ]
        }
      end

      it "returns unprocessable entity and does not save the data" do
        expect do
          post api_v1_event_responses_path(event), params: { response: params }
        end.to change(Response, :count).by(0)
         .and change(Vote, :count).by(0)

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end
