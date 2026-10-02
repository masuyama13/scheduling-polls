require "rails_helper"

RSpec.describe "CORS", type: :request do
  let(:preflight_headers) do
    {
      "Origin" => origin,
      "Access-Control-Request-Method" => "POST"
    }
  end

  context "when the origin is allowed" do
    let(:origin) { "http://localhost:5173" }

    it "allows the preflight request" do
      options "/api/v1/events", headers: preflight_headers

      expect(response).to have_http_status(:ok)
      expect(response.headers["Access-Control-Allow-Origin"]).to eq(origin)
    end
  end

  context "when the origin is not allowed" do
    let(:origin) { "https://untrusted.example" }

    it "does not allow the origin" do
      options "/api/v1/events", headers: preflight_headers

      expect(response.headers).not_to have_key("Access-Control-Allow-Origin")
    end
  end
end
