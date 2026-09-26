require "rails_helper"

# == Schema Information
#
# Table name: responses
#
#  id         :bigint           not null, primary key
#  comment    :text
#  name       :string           not null
#  time_zone  :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  event_id   :bigint           not null
#
RSpec.describe Response, type: :model do
  describe "availability answers" do
    let(:event) { create(:event) }
    let!(:second_time_option) { create(:time_option, event: event, starts_at: Time.current + 14.days) }

      it "requires one answer for every event time option" do
        response = build(:response, event: event)
      response.availabilities.target.pop

      expect(response).not_to be_valid
      expect(response.errors[:availabilities]).to include("must include one answer for every time option")
    end

    it "rejects duplicate time option answers" do
      response = build(:response, event: event)
      response.availabilities << build(
        :availability,
        response: response,
        time_option: event.time_options.first
      )

      expect(response).not_to be_valid
      expect(response.errors[:availabilities]).to include("must not contain duplicate time options")
    end
  end

  describe "field limits" do
    it "validates the participant fields" do
      response = build(:response, name: "a" * 51, comment: "a" * 101, time_zone: "Invalid/Timezone")

      expect(response).not_to be_valid
      expect(response.errors[:name]).to include("is too long (maximum is 50 characters)")
      expect(response.errors[:comment]).to include("is too long (maximum is 100 characters)")
      expect(response.errors[:time_zone]).to include("is invalid")
    end
  end
end
