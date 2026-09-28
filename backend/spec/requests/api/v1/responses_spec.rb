require "rails_helper"

RSpec.describe "Api::V1::Responses", type: :request do
  describe "POST /api/v1/events/:event_public_token/responses" do
    let(:event) { create(:event) }
    let(:time_option1) { event.time_options.first }
    let(:time_option2) { create(:time_option, event: event, starts_at: Time.current + 14.days) }

    context "when the request is valid" do
      let(:params) do
        {
          name: "John",
          comment: "Looking forward to this event!",
          time_zone: "America/Vancouver",
          city_key: "vancouver",
          availabilities_attributes: [
            { time_option_id: time_option1.id, status: :available },
            { time_option_id: time_option2.id, status: :unavailable }
          ]
        }
      end

      it "creates a response with availabilities" do
        expect do
          post api_v1_event_responses_path(event_public_token: event.public_token), params: { response: params }
        end.to change(Response, :count).by(1)
         .and change(Availability, :count).by(2)

        expect(response).to have_http_status(:created)
        json_response = JSON.parse(response.body)
        expect(json_response["name"]).to eq("John")
        expect(json_response["city_key"]).to eq("vancouver")
        expect(json_response["availabilities"].length).to eq(2)
      end
    end

    context "when the event does not exist" do
      let(:params) do
        {
          name: "John",
          comment: "Looking forward to this event!",
          time_zone: "America/Vancouver",
          availabilities_attributes: [
            { time_option_id: time_option1.id, status: :available },
            { time_option_id: time_option2.id, status: :unavailable }
          ]
        }
      end

      it "returns not found and does not save the data" do
        expect do
          post api_v1_event_responses_path(event_public_token: "missing_event_token"), params: { response: params }
        end.to change(Response, :count).by(0)
         .and change(Availability, :count).by(0)

        expect(response).to have_http_status(:not_found)
      end
    end

    context "when the response parameter is missing" do
      let(:params) do
        {
          name: "John",
          comment: "Looking forward to this event!",
          time_zone: "America/Vancouver",
          availabilities_attributes: [
            { time_option_id: time_option1.id, status: :available },
            { time_option_id: time_option2.id, status: :unavailable }
          ]
        }
      end

      it "returns bad request" do
          post api_v1_event_responses_path(event_public_token: event.public_token), params: params

        expect(response).to have_http_status(:bad_request)
      end
    end

    context "when availabilities belong to another event" do
      let(:other_event_time_option) { create(:time_option, event: create(:event), starts_at: Time.current + 8.days) }
      let(:params) do
        {
          name: "John",
          comment: "Looking forward to this event!",
          time_zone: "America/Vancouver",
          availabilities_attributes: [
            { time_option_id: time_option1.id, status: :available },
            { time_option_id: other_event_time_option.id, status: :unavailable }
          ]
        }
      end

      it "returns unprocessable entity and does not save the data" do
        expect do
          post api_v1_event_responses_path(event_public_token: event.public_token), params: { response: params }
        end.to change(Response, :count).by(0)
         .and change(Availability, :count).by(0)

        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "when the response violates validation limits" do
      let(:valid_params) do
        {
          name: "John",
          comment: "Looking forward to this event!",
          time_zone: "America/Vancouver",
          availabilities_attributes: [
            { time_option_id: time_option1.id, status: :available },
            { time_option_id: time_option2.id, status: :unavailable }
          ]
        }
      end

      it "rejects a response without an answer for every time option" do
        params = valid_params.merge(
          availabilities_attributes: [ { time_option_id: time_option1.id, status: :available } ]
        )

        post api_v1_event_responses_path(event_public_token: event.public_token), params: { response: params }

        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)["errors"]).to include(
          "Availabilities must include one answer for every time option"
        )
      end

      it "rejects duplicate answers for the same time option" do
        params = valid_params.merge(
          availabilities_attributes: [
            { time_option_id: time_option1.id, status: :available },
            { time_option_id: time_option1.id, status: :unavailable }
          ]
        )

        expect do
          post api_v1_event_responses_path(event_public_token: event.public_token), params: { response: params }
        end.not_to change(Response, :count)

        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)["errors"]).to include(
          "Availabilities must not contain duplicate time options"
        )
      end

      it "rejects an invalid time zone" do
        params = valid_params.merge(time_zone: "Invalid/Timezone")

        post api_v1_event_responses_path(event_public_token: event.public_token), params: { response: params }

        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)["errors"]).to include("Time zone is invalid")
      end

      it "rejects an overly long name or comment" do
        params = valid_params.merge(name: "a" * 51, comment: "a" * 101)

        post api_v1_event_responses_path(event_public_token: event.public_token), params: { response: params }

        expect(response).to have_http_status(:unprocessable_content)
        errors = JSON.parse(response.body)["errors"]
        expect(errors).to include("Name is too long (maximum is 50 characters)")
        expect(errors).to include("Comment is too long (maximum is 100 characters)")
      end
    end

    context "when the event already has 20 responses" do
      before { create_list(:response, 20, event: event) }

      let(:params) do
        {
          name: "John",
          time_zone: "America/Vancouver",
          availabilities_attributes: [ { time_option_id: time_option1.id, status: :available } ]
        }
      end

      it "rejects the next response" do
        expect do
          post api_v1_event_responses_path(event_public_token: event.public_token), params: { response: params }
        end.not_to change(Response, :count)

        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)["errors"]).to include("An Event can have at most 20 responses")
      end
    end
  end

  describe "PATCH /api/v1/events/:event_public_token/responses/:id" do
    let(:event) { create(:event) }
    let(:time_option1) { event.time_options.first }
    let!(:time_option2) { create(:time_option, event: event, starts_at: Time.current + 14.days) }
    let!(:response_record) { create(:response, event: event) }

    it "updates the response and its availabilities" do
      availability1 = response_record.availabilities.find_by!(time_option: time_option1)
      availability2 = response_record.availabilities.find_by!(time_option: time_option2)

      patch api_v1_event_response_path(event_public_token: event.public_token, id: response_record.id), params: {
        response: {
          name: "Updated name",
          comment: "Updated comment",
          time_zone: "Asia/Tokyo",
          city_key: "tokyo",
          availabilities_attributes: [
            { id: availability1.id, time_option_id: time_option1.id, status: :available },
            { id: availability2.id, time_option_id: time_option2.id, status: :unavailable }
          ]
        }
      }

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response["name"]).to eq("Updated name")
      expect(json_response["city_key"]).to eq("tokyo")
      expect(json_response["availabilities"].find { |item| item["id"] == availability1.id }["status"]).to eq("available")
      expect(response_record.reload.comment).to eq("Updated comment")
    end

    it "rejects an update for a response belonging to another event" do
      other_event = create(:event)

      patch api_v1_event_response_path(event_public_token: other_event.public_token, id: response_record.id), params: {
        response: { name: "Updated name" }
      }

      expect(response).to have_http_status(:not_found)
      expect(response_record.reload.name).to eq("John")
    end
  end

  describe "DELETE /api/v1/events/:event_public_token/responses/:id" do
    let(:event) { create(:event) }
    let!(:response_record) { create(:response, event: event) }

    it "deletes the response and its availabilities" do
      response_id = response_record.id
      availability_id = response_record.availabilities.first.id

      expect do
        delete api_v1_event_response_path(event_public_token: event.public_token, id: response_id)
      end.to change(Response, :count).by(-1).and change(Availability, :count).by(-1)

      expect(response).to have_http_status(:no_content)
      expect(Response.find_by(id: response_id)).to be_nil
      expect(Availability.find_by(id: availability_id)).to be_nil
    end

    it "does not delete a response belonging to another event" do
      other_event = create(:event)

      expect do
        delete api_v1_event_response_path(event_public_token: other_event.public_token, id: response_record.id)
      end.not_to change(Response, :count)

      expect(response).to have_http_status(:not_found)
      expect(response_record.reload).to be_present
    end
  end
end
